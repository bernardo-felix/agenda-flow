import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PgService } from '@/db/postgres/postgres.service';
import { RegisterDto } from '../dto/register.dto';
import * as argon2 from 'argon2';
import { People } from '@/db/postgres/entities/people.entity';

@Injectable()
export class RegisterService {
  constructor(private readonly pg: PgService) {}

  async register({ email, name, password }: RegisterDto) {
    const verifyEmail: People[] = await this.pg.execute(
      'SELECT * FROM people WHERE email = $1',
      [email.toUpperCase()],
    );

    if (verifyEmail.length > 0)
      throw new HttpException('Email já cadastrado', HttpStatus.BAD_REQUEST);

    await this.pg.execute(
      'INSERT INTO people (name, email, password) VALUES ($1, $2, $3)',
      [name.toUpperCase(), email.toUpperCase(), await argon2.hash(password)],
    );
  }
}
