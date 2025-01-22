import { SetAccessService } from './set_access.service';
import { PgService } from '@/db/postgres/postgres.service';
import { RedisService } from '@/db/redis/redis.service';
import { Accesses } from '@/db/postgres/entities/accesses.entity';
import { Mock, vi } from 'vitest';
import keys from '@/db/redis/keys';
import { GroupType } from '@/db/postgres/entities/group_type.enum';

describe('SetAccessService', () => {
  let service: SetAccessService;
  let mockPgService: PgService;
  let mockRedisService: RedisService;

  beforeEach(() => {
    mockPgService = { execute: vi.fn() } as unknown as PgService;
    mockRedisService = { delKey: vi.fn() } as unknown as RedisService;
    service = new SetAccessService(mockPgService, mockRedisService);
  });

  describe('setAccess', () => {
    it('should create access if it does not exist', async () => {
      const personId = 'user123';
      const emptyList: Accesses[] = [];

      (mockPgService.execute as Mock).mockResolvedValueOnce(emptyList);

      await service.setAccess(personId, GroupType.Admin);

      expect(mockPgService.execute).toHaveBeenCalledWith(
        'SELECT * FROM accesses WHERE person_id = $1 AND group_type = $2',
        [personId, GroupType.Admin],
      );

      expect(mockPgService.execute).toHaveBeenCalledWith(
        'INSERT INTO accesses (person_id, group_type) VALUES ($1, $2)',
        [personId, GroupType.Admin],
      );

      expect(mockPgService.execute).toHaveBeenCalledTimes(2);

      expect(mockRedisService.delKey).toHaveBeenCalledWith(
        [...keys.ACCESS, personId].join(';'),
      );
      expect(mockRedisService.delKey).toHaveBeenCalledTimes(1);
    });

    it('should delete access if it already exists', async () => {
      const personId = 'user123';
      const existingAccess: Partial<Accesses>[] = [
        { person_id: personId, group_type: GroupType.Admin },
      ];

      (mockPgService.execute as Mock).mockResolvedValueOnce(existingAccess);

      await service.setAccess(personId, GroupType.Admin);

      expect(mockPgService.execute).toHaveBeenCalledWith(
        'SELECT * FROM accesses WHERE person_id = $1 AND group_type = $2',
        [personId, GroupType.Admin],
      );

      expect(mockPgService.execute).toHaveBeenCalledWith(
        'DELETE FROM accesses WHERE person_id = $1 AND group_type = $2',
        [personId, GroupType.Admin],
      );
      expect(mockPgService.execute).toHaveBeenCalledTimes(2);

      expect(mockRedisService.delKey).toHaveBeenCalledWith(
        [...keys.ACCESS, personId].join(';'),
      );
      expect(mockRedisService.delKey).toHaveBeenCalledTimes(1);
    });
  });
});
