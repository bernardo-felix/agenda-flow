import { Injectable, OnModuleInit } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PgService implements OnModuleInit {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      console.log('Conexão bem-sucedida ao banco de dados!');
      client.release();
    } catch (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
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
