import { Injectable, Inject } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis.Redis,
  ) {}

  async setKey(key: string, value: string, seconds = 5): Promise<'OK'> {
    return await this.redisClient.set(key, value, 'EX', seconds);
  }

  async getKey(key: string): Promise<any | null> {
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

  async delKey(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }
}
