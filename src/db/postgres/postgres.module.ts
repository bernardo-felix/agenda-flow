import { Module, DynamicModule } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';
import { PgService } from './postgres.service';

export interface PgModuleOptions extends PoolConfig {
  isGlobal?: boolean;
}

@Module({
  providers: [PgService],
  exports: [PgService],
})
export class PgModule {
  static register(options: PgModuleOptions): DynamicModule {
    const poolProvider = {
      provide: 'PG_POOL',
      useValue: new Pool(options),
    };

    return {
      module: PgModule,
      global: options.isGlobal ?? false,
      providers: [poolProvider, PgService],
      exports: [PgService],
    };
  }

  static registerAsync(options: {
    isGlobal?: boolean;
    useFactory: (...args: any[]) => Promise<PgModuleOptions> | PgModuleOptions;
    inject?: any[];
  }): DynamicModule {
    const poolProvider = {
      provide: 'PG_POOL',
      useFactory: async (...args: any[]) => {
        const poolConfig = await options.useFactory(...args);
        return new Pool(poolConfig);
      },
      inject: options.inject || [],
    };

    return {
      module: PgModule,
      global: options.isGlobal ?? false,
      providers: [poolProvider, PgService],
      exports: [PgService],
    };
  }
}
