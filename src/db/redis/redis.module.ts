import { Module, DynamicModule } from '@nestjs/common';
import * as ioredis from 'ioredis';
import { RedisService } from './redis.service';

export interface RedisModuleOptions extends ioredis.RedisOptions {
  global?: boolean;
}

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {
  static register(options: RedisModuleOptions): DynamicModule {
    const redisProvider = {
      provide: 'REDIS_CLIENT',
      useFactory: () => new ioredis.Redis(options),
    };

    return {
      module: RedisModule,
      global: options.global ?? false,
      providers: [redisProvider, RedisService],
      exports: [RedisService],
    };
  }

  static registerAsync(options: {
    global?: boolean;
    useFactory: (
      ...args: any[]
    ) => Promise<RedisModuleOptions> | RedisModuleOptions;
    inject?: any[];
  }): DynamicModule {
    const redisProvider = {
      provide: 'REDIS_CLIENT',
      useFactory: async (...args: any[]) => {
        const redisConfig = await options.useFactory(...args);
        return new ioredis.Redis(redisConfig);
      },
      inject: options.inject || [],
    };

    return {
      module: RedisModule,
      global: options.global ?? false,
      providers: [redisProvider, RedisService],
      exports: [RedisService],
    };
  }
}
