import { Module, DynamicModule } from '@nestjs/common';
import * as amqp from 'amqplib';
import { RabbitService } from './rabbit.service';
import { AppointmentReceiver } from './appointment.receiver';

export interface RabbitModuleOptions {
  uri: string;
  global?: boolean;
}

@Module({
  providers: [RabbitService],
  exports: [RabbitService],
})
export class RabbitModule {
  static register(options: RabbitModuleOptions): DynamicModule {
    const rabbitMQProvider = {
      provide: 'RABBITMQ_CONNECTION',
      useFactory: async () => {
        try {
          const connection = await amqp.connect(options.uri);
          return connection;
        } catch {
          return null;
        }
      },
    };

    return {
      module: RabbitModule,
      global: options.global ?? false,
      providers: [rabbitMQProvider, RabbitService, AppointmentReceiver],
      exports: [RabbitService],
    };
  }

  static registerAsync(options: {
    global?: boolean;
    useFactory: (
      ...args: any[]
    ) => Promise<RabbitModuleOptions> | RabbitModuleOptions;
    inject?: any[];
  }): DynamicModule {
    const rabbitMQProvider = {
      provide: 'RABBITMQ_CONNECTION',
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);
        try {
          const connection = await amqp.connect(config.uri);
          return connection;
        } catch {
          return null;
        }
      },
      inject: options.inject || [],
    };

    return {
      module: RabbitModule,
      global: options.global ?? false,
      providers: [rabbitMQProvider, RabbitService, AppointmentReceiver],
      exports: [RabbitService],
    };
  }
}
