import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CancelService } from './cancel.service';
import { PgService } from '@/db/postgres/postgres.service';
import { AppointmentStatus } from '@/db/postgres/entities/appointment_status.enum';
import { HttpException } from '@nestjs/common';
import { DateTime } from 'luxon';

const mockPgService = {
  execute: vi.fn(),
};

describe('CancelService', () => {
  let cancelService: CancelService;

  beforeEach(() => {
    vi.clearAllMocks();
    cancelService = new CancelService(mockPgService as unknown as PgService);
  });

  it('should throw an error if the appointment is not found', async () => {
    mockPgService.execute.mockResolvedValueOnce([]);

    await expect(
      cancelService.cancel('person-123', 'appointment-123'),
    ).rejects.toThrowError(
      new HttpException('Não foi possivel localizar esse agendamento', 400),
    );

    expect(mockPgService.execute).toHaveBeenCalledWith(
      'SELECT * FROM appointments WHERE id = $1',
      ['appointment-123'],
    );
  });

  it('should throw an error if the appointment belongs to another person', async () => {
    mockPgService.execute.mockResolvedValueOnce([
      {
        id: 'appointment-123',
        person_id: 'person-456',
        scheduled_at: new Date(),
        status: AppointmentStatus.Scheduled,
      },
    ]);

    await expect(
      cancelService.cancel('person-123', 'appointment-123'),
    ).rejects.toThrowError(
      new HttpException('Só o criador do agendamento pode cancelar ele', 400),
    );
  });

  it('should throw an error if the appointment is less than 15 minutes away', async () => {
    mockPgService.execute.mockResolvedValueOnce([
      {
        id: 'appointment-123',
        person_id: 'person-123',
        scheduled_at: DateTime.now().plus({ minutes: 10 }).toJSDate(),
        status: AppointmentStatus.Scheduled,
      },
    ]);

    await expect(
      cancelService.cancel('person-123', 'appointment-123'),
    ).rejects.toThrowError(
      new HttpException(
        'Não pode cancelar um agendamento faltando menos de 15 minutos',
        400,
      ),
    );
  });

  it('should cancel the appointment successfully', async () => {
    mockPgService.execute.mockResolvedValueOnce([
      {
        id: 'appointment-123',
        person_id: 'person-123',
        scheduled_at: DateTime.now().plus({ minutes: 30 }).toJSDate(),
        status: AppointmentStatus.Scheduled,
      },
    ]);

    await cancelService.cancel('person-123', 'appointment-123');

    expect(mockPgService.execute).toHaveBeenNthCalledWith(
      1,
      'SELECT * FROM appointments WHERE id = $1',
      ['appointment-123'],
    );

    expect(mockPgService.execute).toHaveBeenNthCalledWith(
      2,
      'UPDATE appointments SET status = $1 WHERE id = $2',
      [AppointmentStatus.Cancelled, 'appointment-123'],
    );
  });
});
