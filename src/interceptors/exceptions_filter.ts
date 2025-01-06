import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  public catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    if (exception instanceof HttpException) {
      this.catchHttpException(exception, request, response);
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      message: exception?.message,
      path: request.url,
      stacktrace: exception?.['stack'],
    });
  }

  private catchHttpException(
    exception: HttpException,
    request: FastifyRequest,
    response: FastifyReply,
  ) {
    const statusCode = exception.getStatus();
    const respMessage = exception.getResponse().valueOf();
    let message = exception.message;

    if (typeof respMessage == 'object')
      message = respMessage['message'] ? respMessage['message'] : message;

    if (statusCode >= 400 && statusCode < 500) {
      const { error } = <any>exception.getResponse();
      response.status(statusCode).send({
        message,
        error,
        path: request.url,
        stacktrace: exception.stack,
      });

      return;
    }

    response.status(statusCode).send({
      message,
      path: request.url,
      stacktrace: exception.stack,
    });
  }
}
