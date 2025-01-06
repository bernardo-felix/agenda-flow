import { Body, Controller, Post } from '@nestjs/common';
import { RegisterService } from '../services/register.service';
import { RegisterDto } from '../dto/register.dto';
import { Roles } from 'src/auth/guard';
import { GroupType } from 'src/db/postgres/entities/group_type.enum';
@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Roles(GroupType.Admin)
  @Post()
  async register(@Body() body: RegisterDto) {
    return await this.registerService.register(body);
  }
}
