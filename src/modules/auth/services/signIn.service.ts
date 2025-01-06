import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PgService } from 'src/db/postgres/postgres.service';
import * as argon2 from 'argon2';
import { SignInDto } from '../dto/signIn.dto';
import { People } from 'src/db/postgres/entities/people.entity';
import { TokenService } from './token.service';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class SignInService {
  constructor(
    private readonly pg: PgService,
    private readonly tokenService: TokenService,
  ) {}

  async signIn(i18n: I18nContext, { email, password }: SignInDto) {
    const verifyEmail: People[] = await this.pg.execute(
      'SELECT * FROM people WHERE email = $1',
      [email.toUpperCase()],
    );

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
