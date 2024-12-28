import { Module } from '@nestjs/common';
import { SignInController } from '../auth/controllers/signIn.controller';
import { SignInService } from '../auth/services/signIn.service';
import { TokenService } from '../auth/services/token.service';
import { RefreshService } from '../auth/services/refresh.service';
import { RefreshController } from '../auth/controllers/refresh.controller';

@Module({
  controllers: [SignInController, RefreshController],
  providers: [SignInService, TokenService, RefreshService],
})
export class AuthModule {}
