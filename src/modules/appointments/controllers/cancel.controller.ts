import { Controller, Param, Post } from '@nestjs/common';
import { User } from '@/decorators/user.decorator';
import { CancelService } from '../services/cancel.service';

@Controller('cancel')
export class CancelController {
  constructor(private readonly cancelService: CancelService) {}

  @Post('/:appointmentId')
  async cancel(
    @User() personId: string,
    @Param('appointmentId') appointmentId: string,
  ) {
    return await this.cancelService.cancel(personId, appointmentId);
  }
}
