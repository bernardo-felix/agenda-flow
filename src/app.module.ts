import { Module } from '@nestjs/common';
import { PgModule } from './db/postgres/postgres.module';
import { PeopleModule } from './modules/people/people.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from './interceptors/exceptions_filter';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import path from 'path';
import { JwtAuthGuard } from './auth/guard';
import { JwtStrategy } from './auth/passport';
import { RedisModule } from './db/redis/redis.module';
import { AppointmentModule } from './modules/appointments/appointments.module';
import { RabbitModule } from './db/rabbit/rabbit.module';

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

    RedisModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        password: configService.get<string>('REDIS_PASSWORD'),
        db: configService.get<number>('REDIS_DB'),
        retryStrategy: null,
      }),
    }),

    PgModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        user: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
      }),
    }),

    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('TOKEN_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),

    RabbitModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('RABBIT_URI'),
      }),
    }),

    PeopleModule,
    AppointmentModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    JwtStrategy,
  ],
})
export class AppModule {}
