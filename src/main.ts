import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { VersioningType } from '@nestjs/common';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import { Http2ServerRequest } from 'http2';
import metadata from './metadata';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { Settings } from 'luxon';

export function genReqId(req: IncomingMessage | Http2ServerRequest): string {
  return req['id'] || randomUUID();
}

async function bootstrap() {
  Settings.defaultLocale = 'UTC';

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      requestIdHeader: 'X-Request-ID',
      genReqId,
    }),
    { bufferLogs: true },
  );

  app.enableCors({
    methods: ['*'],
    origin: ['*'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-authorization-type'],
  });

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.flushLogs();
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Agenda FLOW')
    .setDescription('apis for agenda FLOW')
    .setVersion('1.0')
    // .addBearerAuth(
    //   { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
    //   'Authorization',
    // )adicionar quando houver rotas com auth
    .build();

  await SwaggerModule.loadPluginMetadata(metadata);
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableVersioning({ defaultVersion: '1', type: VersioningType.URI });

  //app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalPipes(new I18nValidationPipe());
  app.useGlobalFilters(new I18nValidationExceptionFilter());

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
