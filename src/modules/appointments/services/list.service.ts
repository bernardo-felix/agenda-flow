import { Injectable } from '@nestjs/common';
import { PgService } from '@/db/postgres/postgres.service';
import { RedisService } from '@/db/redis/redis.service';
import keys from '@/db/redis/keys';
import { People } from '@/db/postgres/entities/people.entity';

@Injectable()
export class ListService {
  constructor(
    private readonly pg: PgService,
    private readonly redis: RedisService,
  ) {}

  async list(userId: string, start: string, end: string) {
    let infos: People[] = await this.redis.getKey(
      [...keys.PERSON.INFO, userId].join(':'),
    );

    if (!infos)
      infos = await this.pg.execute('SELECT * FROM people WHERE id = $1', [
        userId,
      ]);

    return await this.pg.execute(
      `SELECT 
        a.scheduled_at,
        a.status,
        ai.subject
    FROM appointments a
    JOIN appointments_info ai ON ai.appointment_id = a.id
    WHERE $1 = ANY(ai.emails)
    AND a.scheduled_at BETWEEN $2 AND $3;`,
      [infos[0].email, start, end],
    );
  }
}
