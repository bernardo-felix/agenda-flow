import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { Pool } from 'pg';

@Injectable()
export class PgService implements OnModuleInit {
  constructor(
    @Inject('PG_POOL') private readonly pool: Pool,
    private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      this.logger.log('Conexão bem-sucedida ao banco de dados!');
      client.release();
    } catch (err) {
      throw new HttpException(
        'Erro fatal ao conectar ao banco de dados. O serviço não pode continuar.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async execute(query: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      const res = await client.query(query, params);
      return res.rows;
    } catch (err) {
      throw err;
    } finally {
      client.release();
    }
  }
}
