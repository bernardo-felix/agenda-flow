import { Body, Controller, Post } from '@nestjs/common';
import { CreateService } from '../services/create.service';
import { CreateDto } from '../dto/create.dto';
import { User } from '@/decorators/user.decorator';

@Controller('create')
export class CreateController {
  constructor(private readonly createService: CreateService) {}

  @Post()
  async create(@User() personId: string, @Body() body: CreateDto) {
    return await this.createService.create(personId, body);
  }
}
