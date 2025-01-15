import { Module } from '@nestjs/common';
import { RegisterController } from './controllers/register.controller';
import { RegisterService } from './services/register.service';
import { SetAcccessController } from './controllers/set_access.controller';
import { SetAccessService } from './services/set_access.service';

@Module({
  controllers: [RegisterController, SetAcccessController],
  providers: [RegisterService, SetAccessService],
})
export class PeopleModule {}
