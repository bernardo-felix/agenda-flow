import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PgService } from '@/db/postgres/postgres.service';
import * as argon2 from 'argon2';
import { SignInDto } from '../dto/signIn.dto';
import { People } from '@/db/postgres/entities/people.entity';
import { TokenService } from './token.service';
import { I18nContext } from 'nestjs-i18n';
import { RedisService } from '@/db/redis/redis.service';
import keys from '@/db/redis/keys';

@Injectable()
export class SignInService {
  constructor(
    private readonly pg: PgService,
    private readonly tokenService: TokenService,
    private readonly redisService: RedisService,
  ) {}

  async signIn(i18n: I18nContext, { email, password }: SignInDto) {
    let verifyEmail: People[] = await this.redisService.getKey(
      [...keys.PERSON.INFO, email].join(';'),
    );

    if (!verifyEmail) {
      verifyEmail = await this.pg.execute(
        'SELECT * FROM people WHERE email = $1',
        [email.toUpperCase()],
      );

      await this.redisService.setKey(
        [...keys.PERSON.INFO, email].join(';'),
        JSON.stringify(verifyEmail),
        60 * 60 * 12,
      );
    }

    if (verifyEmail.length == 0)
      throw new HttpException(
        i18n.t('auth.email.not_found'),
        HttpStatus.BAD_REQUEST,
      );

    const verifyPassword = await argon2.verify(
      verifyEmail[0].password,
      password,
    );

    if (!verifyPassword)
      throw new HttpException(
        i18n.t('auth.password.wrong'),
        HttpStatus.UNAUTHORIZED,
      );

    return {
      token: await this.tokenService.generateAccessToken(verifyEmail[0].id),
      refreshToken: await this.tokenService.generateRefreshToken(
        verifyEmail[0].id,
      ),
    };
  }
}
