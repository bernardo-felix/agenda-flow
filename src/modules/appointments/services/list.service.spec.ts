import { vi, describe, it, expect, beforeEach, Mocked } from 'vitest';
import { ListService } from './list.service';
import { PgService } from '@/db/postgres/postgres.service';
import { RedisService } from '@/db/redis/redis.service';
import keys from '@/db/redis/keys';
import { People } from '@/db/postgres/entities/people.entity';

describe('ListService', () => {
  let listService: ListService;
  let pgServiceMock: Mocked<PgService>;
  let redisServiceMock: Mocked<RedisService>;

  beforeEach(() => {
    pgServiceMock = {
      execute: vi.fn(),
    } as unknown as Mocked<PgService>;

    redisServiceMock = {
      getKey: vi.fn(),
    } as unknown as Mocked<RedisService>;

    listService = new ListService(pgServiceMock, redisServiceMock);
  });

  it('should return appointments when infos are in Redis', async () => {
    const userId = 'user123';
    const start = '2024-01-01';
    const end = '2024-01-31';

    const redisData: Partial<People>[] = [{ email: 'user123@example.com' }];
    redisServiceMock.getKey.mockResolvedValue(redisData);

    pgServiceMock.execute.mockResolvedValue([
      { scheduled_at: '2024-01-15', status: 'scheduled', subject: 'Meeting' },
    ]);

    const result = await listService.list(userId, start, end);

    expect(redisServiceMock.getKey).toHaveBeenCalledWith(
      `${keys.PERSON.INFO.join(':')}:${userId}`,
    );

    expect(pgServiceMock.execute).not.toHaveBeenCalledWith();

    expect(result).toEqual([
      { scheduled_at: '2024-01-15', status: 'scheduled', subject: 'Meeting' },
    ]);
  });

  it('should fetch from PostgreSQL when infos are not in Redis', async () => {
    const userId = 'user123';
    const start = '2024-01-01';
    const end = '2024-01-31';

    redisServiceMock.getKey.mockResolvedValue(null);

    const peopleData: Partial<People>[] = [{ email: 'user123@example.com' }];
    pgServiceMock.execute.mockResolvedValue(peopleData);

    pgServiceMock.execute.mockResolvedValue([
      { scheduled_at: '2024-01-15', status: 'scheduled', subject: 'Meeting' },
    ]);

    const result = await listService.list(userId, start, end);

    expect(redisServiceMock.getKey).toHaveBeenCalledWith(
      `${keys.PERSON.INFO.join(':')}:${userId}`,
    );

    expect(pgServiceMock.execute).toHaveBeenCalledWith(
      'SELECT * FROM people WHERE id = $1',
      [userId],
    );

    expect(result).toEqual([
      { scheduled_at: '2024-01-15', status: 'scheduled', subject: 'Meeting' },
    ]);
  });
});
