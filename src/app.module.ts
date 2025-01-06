import { Module } from '@nestjs/common';
import { PgModule } from './db/postgres/postgres.module';
import { PeopleModule } from './modules/people/people.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './interceptors/exceptions_filter';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        redact: ['req.headers.authorization'],
        customLogLevel: (res, err) => {
          if (res.statusCode >= 400 || err.statusCode == 404) {
            return 'warn';
          }

          if (res.statusCode >= 500 || err.statusCode >= 400) {
            return 'error';
          }

          return 'info';
        },
        customProps: (req) => ({
          traceId: req.headers['X-Request-ID'],
          user: req.headers['user'] || null,
        }),
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),

    PgModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        user: configService.get<string>('DB_USER') || 'pg',
        password: configService.get<string>('DB_PASSWORD') || 'pg',
        database: configService.get<string>('DB_DATABASE') || 'db',
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('TOKEN_SECRET') || 'signIn',
        signOptions: { expiresIn: '1h' },
      }),
    }),
    PeopleModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
