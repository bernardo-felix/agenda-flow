import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { Connection, Channel } from 'amqplib';
import { Logger } from 'nestjs-pino';

export const APPOINTMENT_QUEUE = 'appointment';

@Injectable()
export class RabbitService implements OnModuleInit {
  private channel: Channel;

  constructor(
    @Inject('RABBITMQ_CONNECTION') private readonly connection: Connection,
    private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    try {
      this.channel = await this.connection.createChannel();
      this.logger.log('Conexão bem-sucedida ao banco de dados!');

      await this.channel.assertExchange(
        'delayed_exchange',
        'x-delayed-message',
        {
          arguments: { 'x-delayed-type': 'direct' },
        },
      );
    } catch (err) {
      throw new HttpException(
        'Erro fatal ao conectar ao banco de dados. O serviço não pode continuar.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendToQueueWithDelay(queue: string, message: object, delay = 0) {
    try {
      if (!this.channel) {
        throw new HttpException(
          'O canal do RabbitMQ não está inicializado.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const messageBuffer = Buffer.from(JSON.stringify(message));

      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.bindQueue(queue, 'delayed_exchange', queue);

      this.channel.publish('delayed_exchange', queue, messageBuffer, {
        headers: { 'x-delay': delay },
      });

      this.logger.log(
        `Mensagem enviada para a fila "${queue}" com delay de ${delay}ms: ${JSON.stringify(message)}`,
      );
    } catch (err) {
      this.logger.error(
        `Erro ao enviar mensagem para a fila "${queue}" com delay:`,
        err,
      );
      throw new HttpException(
        'Erro ao enviar mensagem para a fila com delay.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
