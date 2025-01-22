import { Controller, Param, Post } from '@nestjs/common';
import { Roles } from '@/auth/guard';
import { GroupType } from '@/db/postgres/entities/group_type.enum';
import { SetAccessService } from '../services/set_access.service';
@Controller()
export class SetAcccessController {
  constructor(private readonly setAccessService: SetAccessService) {}

  @Roles(GroupType.Admin)
  @Post('/:personId/access/:access')
  async setAccess(
    @Param('personId') personId: string,
    @Param('access') access: string,
  ) {
    return await this.setAccessService.setAccess(personId, access);
  }
}
