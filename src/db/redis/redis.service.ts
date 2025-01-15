import {
  Injectable,
  Inject,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { Logger } from 'nestjs-pino';

@Injectable()
export class RedisService implements OnModuleInit {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    try {
      await this.redisClient.ping();
      this.logger.log('Conexão bem-sucedida ao banco de dados!');
    } catch (err) {
      throw new HttpException(
        'Erro fatal ao conectar ao banco de dados. O serviço não pode continuar.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async setKey(key: string, value: string, seconds = 60) {
    return await this.redisClient.set(key, value, 'EX', seconds);
  }

  async getKey(key: string) {
    const resp = await this.redisClient.get(key);
    if (resp) {
      try {
        return JSON.parse(resp);
      } catch (error) {
        return resp;
      }
    }
    return null;
  }

  async delKey(key: string) {
    return await this.redisClient.del(key);
  }
}
