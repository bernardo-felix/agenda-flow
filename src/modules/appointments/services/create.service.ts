import { Injectable } from '@nestjs/common';
import { PgService } from 'src/db/postgres/postgres.service';
import { CreateDto } from '../dto/create.dto';
import { AppointmentStatus } from 'src/db/postgres/entities/appointment_status.enum';
import { APPOINTMENT_QUEUE, RabbitService } from 'src/db/rabbit/rabbit.service';
import { DateTime } from 'luxon';

@Injectable()
export class CreateService {
  constructor(
    private readonly pg: PgService,
    private readonly queue: RabbitService,
  ) {}

  async create(personId: string, { scheduledAt, infos }: CreateDto) {
    const { body, emails, subject } = infos;

    const appointment: { appointment_id: string }[] = await this.pg.execute(
      `WITH inserted_appointment AS (
            INSERT INTO appointments (
                person_id, 
                scheduled_at, 
                status
            ) 
            VALUES (
                $1,
                $2,
                $3
            )
            RETURNING id 
        )
        INSERT INTO appointments_info (
            appointment_id, 
            subject, 
            body, 
            emails
        )
        SELECT 
            id,
            $4,
            $5,
            $6
        FROM inserted_appointment
        RETURNING appointment_id;`,
      [
        personId,
        scheduledAt ?? null,
        scheduledAt
          ? AppointmentStatus.Scheduled
          : AppointmentStatus.Processing,
        subject,
        body,
        emails,
      ],
    );

    await this.queue.sendToQueueWithDelay(
      APPOINTMENT_QUEUE,
      {
        id: appointment[0].appointment_id,
      },
      DateTime.fromJSDate(scheduledAt).diff(DateTime.now()).milliseconds,
    );
  }
}
