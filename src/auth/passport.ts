import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { Accesses } from 'src/db/postgres/entities/accesses.entity';
import { PgService } from 'src/db/postgres/postgres.service';
import { RedisService } from 'src/db/redis/redis.service';

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

  async validate(payload: { id: string }) {
    const cache = await this.redisService.getKey(payload.id);
    console.log(cache);
    if (!cache) {
      const resp: Accesses[] = await this.pg.execute(
        'SELECT * FROM accesses WHERE person_id = $1',
        [payload.id],
      );

      const infos = {
        id: payload.id,
        groups: resp.map((e) => e.group_type),
      };
      await this.redisService.setKey(payload.id, JSON.stringify(infos));
      console.log(infos);
      return infos;
    }

    return cache;
  }
}
