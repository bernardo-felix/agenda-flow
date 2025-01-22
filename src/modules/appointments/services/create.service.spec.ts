import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateService } from './create.service';
import { PgService } from '@/db/postgres/postgres.service';
import { RabbitService } from '@/db/rabbit/rabbit.service';
import { AppointmentStatus } from '@/db/postgres/entities/appointment_status.enum';
import { DateTime } from 'luxon';

const mockPgService = {
  execute: vi.fn(),
};

const mockRabbitService = {
  sendToQueueWithDelay: vi.fn(),
};

describe('CreateService', () => {
  let createService: CreateService;

  beforeEach(() => {
    vi.clearAllMocks();
    createService = new CreateService(
      mockPgService as unknown as PgService,
      mockRabbitService as unknown as RabbitService,
    );
  });

  it('should create an appointment with scheduled status and send to queue with delay', async () => {
    const personId = 'person-123';
    const scheduledAt = new Date();
    const infos = {
      body: 'Test body',
      emails: ['test@example.com'],
      subject: 'Test subject',
    };

    const expectedAppointmentId = 'appointment-123';

    mockPgService.execute.mockResolvedValueOnce([
      { appointment_id: expectedAppointmentId },
    ]);

    await createService.create(personId, { scheduledAt, infos });

    expect(mockPgService.execute).toHaveBeenCalledWith(expect.any(String), [
      personId,
      scheduledAt,
      AppointmentStatus.Scheduled,
      infos.subject,
      infos.body,
      infos.emails,
    ]);

    expect(mockRabbitService.sendToQueueWithDelay).toHaveBeenCalledWith(
      'appointment',
      { id: expectedAppointmentId },
      expect.any(Number),
    );

    const delay = DateTime.fromJSDate(scheduledAt).diff(
      DateTime.now(),
    ).milliseconds;

    expect(mockRabbitService.sendToQueueWithDelay.mock.calls[0][2]).toBeCloseTo(
      delay,
      -2,
    );
  });

  it('should create an appointment with processing status and send to queue without delay', async () => {
    const personId = 'person-123';
    const infos = {
      body: 'Test body',
      emails: ['test@example.com'],
      subject: 'Test subject',
    };

    const expectedAppointmentId = 'appointment-123';

    mockPgService.execute.mockResolvedValueOnce([
      { appointment_id: expectedAppointmentId },
    ]);

    await createService.create(personId, { scheduledAt: null, infos });

    expect(mockPgService.execute).toHaveBeenCalledWith(expect.any(String), [
      personId,
      null,
      AppointmentStatus.Processing,
      infos.subject,
      infos.body,
      infos.emails,
    ]);

    expect(mockRabbitService.sendToQueueWithDelay).toHaveBeenCalledWith(
      'appointment',
      { id: expectedAppointmentId },
      NaN,
    );
  });
});
