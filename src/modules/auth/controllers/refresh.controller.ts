import { Body, Controller, Post } from '@nestjs/common';
import { RefreshDto } from '../dto/refresh.dto';
import { RefreshService } from '../services/refresh.service';

@Controller('refresh')
export class RefreshController {
  constructor(private readonly refreshService: RefreshService) {}

  @Post()
  async refresh(@Body() body: RefreshDto) {
    return await this.refreshService.refresh(body);
  }
}
