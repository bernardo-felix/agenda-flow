import { Module } from '@nestjs/common';
import { PgModule } from './db/postgres/postgres.module';
import { PeopleModule } from './modules/people/people.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    PgModule.register({
      host: 'localhost',
      port: 5432,
      user: 'pg',
      password: 'pg',
      database: 'db',
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: 'signIn',
      signOptions: { expiresIn: '1h' },
    }),
    PeopleModule,
    AuthModule,
  ],
})
export class AppModule {}
