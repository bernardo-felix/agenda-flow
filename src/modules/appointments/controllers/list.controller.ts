import { Controller, Get, Param } from '@nestjs/common';
import { ListService } from '../services/list.service';
import { User } from '@/decorators/user.decorator';

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Get('start/:start/end/:end')
  async list(
    @User() userId: string,
    @Param('start') start: string,
    @Param('end') end: string,
  ) {
    return await this.listService.list(userId, start, end);
  }
}
