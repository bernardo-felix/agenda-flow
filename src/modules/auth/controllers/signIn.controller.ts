import { Body, Controller, Post } from '@nestjs/common';
import { SignInDto } from '../dto/signIn.dto';
import { SignInService } from '../services/signIn.service';

@Controller('signIn')
export class SignInController {
  constructor(private readonly signInService: SignInService) {}

  @Post()
  async signIn(@Body() body: SignInDto) {
    return await this.signInService.signIn(body);
  }
}
