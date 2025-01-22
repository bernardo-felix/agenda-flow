import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PgService } from '@/db/postgres/postgres.service';
import { AppointmentStatus } from '@/db/postgres/entities/appointment_status.enum';
import { Appointments } from '@/db/postgres/entities/appointments.entity';
import { DateTime } from 'luxon';

@Injectable()
export class CancelService {
  constructor(private readonly pg: PgService) {}

  async cancel(personId: string, appointmentId: string) {
    const infos: Appointments[] = await this.pg.execute(
      'SELECT * FROM appointments WHERE id = $1',
      [appointmentId],
    );

    if (infos.length == 0)
      throw new HttpException(
        'Não foi possivel localizar esse agendamento',
        HttpStatus.BAD_REQUEST,
      );

    if (infos[0].person_id != personId)
      throw new HttpException(
        'Só o criador do agendamento pode cancelar ele',
        HttpStatus.BAD_REQUEST,
      );

    if (
      DateTime.fromJSDate(infos[0].scheduled_at).diff(DateTime.now(), 'minutes')
        .minutes < 15
    )
      throw new HttpException(
        'Não pode cancelar um agendamento faltando menos de 15 minutos',
        HttpStatus.BAD_REQUEST,
      );

    await this.pg.execute(`UPDATE appointments SET status = $1 WHERE id = $2`, [
      AppointmentStatus.Cancelled,
      appointmentId,
    ]);
  }
}
