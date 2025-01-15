import { Injectable } from '@nestjs/common';
import { PgService } from 'src/db/postgres/postgres.service';
import { Accesses } from 'src/db/postgres/entities/accesses.entity';
import { RedisService } from 'src/db/redis/redis.service';
import keys from 'src/db/redis/keys';

@Injectable()
export class SetAccessService {
  constructor(
    private readonly pg: PgService,
    private readonly redisService: RedisService,
  ) {}

  async setAccess(personId: string, access: string) {
    const listAccess: Accesses[] = await this.pg.execute(
      'SELECT * FROM accesses WHERE person_id = $1 AND group_type = $2',
      [personId, access],
    );

    listAccess.length > 0
      ? await this.createAccess(personId, access)
      : await this.deleteAccess(personId, access);

    await this.redisService.delKey([...keys.ACCESS, personId].join(';'));
  }

  async createAccess(personId, access) {
    await this.pg.execute(
      'INSERT INTO accesses (person_id, group_type) VALUES ($1, $2)',
      [personId, access],
    );
  }

  async deleteAccess(personId: string, access: string) {
    await this.pg.execute(
      'DELETE FROM accesses WHERE person_id = $1 AND group_type = $2',
      [personId, access],
    );
  }
}
