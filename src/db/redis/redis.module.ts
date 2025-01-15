import { Module, DynamicModule } from '@nestjs/common';
import { Redis, RedisOptions } from 'ioredis';
import { RedisService } from './redis.service';
import { WebsocketService } from './websocket.service';

export interface RedisModuleOptions extends RedisOptions {
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
      useFactory: () => {
        try {
          return new Redis(options);
        } catch {
          return null;
        }
      },
    };

    return {
      module: RedisModule,
      global: options.global ?? false,
      providers: [redisProvider, RedisService, WebsocketService],
      exports: [RedisService, WebsocketService],
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
        try {
          return new Redis(redisConfig);
        } catch {
          return null;
        }
      },
      inject: options.inject || [],
    };

    return {
      module: RedisModule,
      global: options.global ?? false,
      providers: [redisProvider, RedisService, WebsocketService],
      exports: [RedisService, WebsocketService],
    };
  }
}
