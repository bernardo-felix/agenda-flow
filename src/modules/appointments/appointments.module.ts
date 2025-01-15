import { Module } from '@nestjs/common';
import { CreateController } from './controllers/create.controller';
import { CreateService } from './services/create.service';
import { CancelController } from './controllers/cancel.controller';
import { CancelService } from './services/cancel.service';

@Module({
  controllers: [CreateController, CancelController],
  providers: [CreateService, CancelService],
})
export class AppointmentModule {}
