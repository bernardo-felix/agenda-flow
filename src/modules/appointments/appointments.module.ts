import { Module } from '@nestjs/common';
import { CreateController } from './controllers/create.controller';
import { CreateService } from './services/create.service';
import { CancelController } from './controllers/cancel.controller';
import { CancelService } from './services/cancel.service';
import { ListService } from './services/list.service';
import { ListController } from './controllers/list.controller';

@Module({
  controllers: [CreateController, CancelController, ListController],
  providers: [CreateService, CancelService, ListService],
})
export class AppointmentModule {}
