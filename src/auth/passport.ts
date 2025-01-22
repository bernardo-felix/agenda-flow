import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { Accesses } from '@/db/postgres/entities/accesses.entity';
import { PgService } from '@/db/postgres/postgres.service';
import { RedisService } from '@/db/redis/redis.service';
import keys from '../db/redis/keys';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly pg: PgService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'signIn',
    });
  }

  async validate({ id }: { id: string }) {
    const cache = await this.redisService.getKey(
      [...keys.ACCESS, id].join(':'),
    );

    if (!cache) {
      const resp: Accesses[] = await this.pg.execute(
        'SELECT * FROM accesses WHERE person_id = $1',
        [id],
      );

      const infos = {
        id: id,
        groups: resp.map((e) => e.group_type),
      };

      await this.redisService.setKey(
        [...keys.ACCESS, id].join(':'),
        JSON.stringify(infos),
      );

      return infos;
    }

    return cache;
  }
}
