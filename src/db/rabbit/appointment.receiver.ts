import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { APPOINTMENT_QUEUE } from './rabbit.service';
import { Logger } from 'nestjs-pino';
import { PgService } from '../postgres/postgres.service';
import { AppointmentStatus } from '../postgres/entities/appointment_status.enum';
import { Connection, Message } from 'amqplib';
import { google } from 'googleapis';
import { createTransport } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { WebsocketService } from '../redis/websocket.service';

@Injectable()
export class AppointmentReceiver implements OnModuleInit {
  constructor(
    @Inject('RABBITMQ_CONNECTION') private readonly connection: Connection,
    private readonly logger: Logger,
    private readonly pg: PgService,
    private readonly configService: ConfigService,
    private readonly websocket: WebsocketService,
  ) {}

  async onModuleInit() {
    try {
      const channel = await this.connection.createChannel();
      await channel.consume(APPOINTMENT_QUEUE, async (msg: Message) => {
        const body: { id: string } = JSON.parse(msg.content.toString('utf8'));
        this.logger.log('Proccess message: ', body);

        await this.proccess(body);
        channel.ack(msg);
      });
    } catch (error) {
      this.logger.error('Erro ao conectar ao RabbitMQ:', error);
    }
  }

  async proccess({ id }: { id: string }) {
    const infos: {
      status: AppointmentStatus;
      subject: string;
      body: string;
      emails: string[];
    }[] = await this.pg.execute(
      `SELECT
        a.status,
        ai.subject,
        ai.body,
        ai.emails
      FROM appointments a 
      JOIN appointments_info ai ON a.id = ai.appointment_id
      WHERE a.id = $1`,
      [id],
    );

    if (infos[0].status == AppointmentStatus.Sent) return;
    if (infos[0].status == AppointmentStatus.Cancelled) {
      this.websocket.sendNotification('notification', {
        cancel: true,
        subjects: infos[0].subject,
        body: infos[0].body,
      });
      return;
    }

    await this.sendEmail(infos[0]);

    this.websocket.sendNotification('notification', {
      subjects: infos[0].subject,
      body: infos[0].body,
    });

    await this.pg.execute('UPDATE appointments SET status = $1 WHERE id = $2', [
      AppointmentStatus.Sent,
      id,
    ]);
  }

  async getToken() {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      this.configService.get<string>('CLIENT_ID'),
      this.configService.get<string>('CLIENT_SECRET'),
      'https://developers.google.com/oauthplayground',
    );

    oauth2Client.setCredentials({
      refresh_token: this.configService.get<string>('REFRESH_TOKEN'),
    });

    const token = await oauth2Client.getAccessToken();
    return token.token;
  }

  async sendEmail(infos: { subject: string; body: string; emails: string[] }) {
    const token = await this.getToken();

    const transporter = createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.get<string>('EMAIL'),
        accessToken: token,
        clientId: this.configService.get<string>('CLIENT_ID'),
        clientSecret: this.configService.get<string>('CLIENT_SECRET'),
        refreshToken: this.configService.get<string>('REFRESH_TOKEN'),
      },
    });

    await transporter.sendMail({
      subject: infos.subject,
      text: infos.body,
      to: infos.emails.join(','),
      from: process.env.EMAIL,
    });
  }
}
