import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: true })
export class WebsocketService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async afterInit() {
    const redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB_WEBSOCKET'),
      retryStrategy: null,
    });

    const subClient = redisClient.duplicate();

    this.server.adapter(createAdapter(this.redisClient, subClient));
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.headers['authorization'];
    if (!token) return client.disconnect();

    try {
      await this.jwtService.verify(token.split(' ')[1]);
      this.logger.log(`User connected: ${client.id}`);
    } catch {
      return client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    client.disconnect();
    this.logger.log(`User disconnected: ${client.id}`);
  }

  sendNotification(events: string[], message: string | object) {
    for (const event of events) {
      this.server.emit(event, { message });
    }
  }
}
