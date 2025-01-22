import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SignInDto } from '../dto/signIn.dto';
import { SignInService } from '../services/signIn.service';
import { ApiResponse } from '@nestjs/swagger';
import { SignInResponse } from '../dto/response/signIn.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Public } from '@/auth/guard';

@Controller('signIn')
export class SignInController {
  constructor(private readonly signInService: SignInService) {}

  /**
   * @remarks Return a token for auth.
   */
  @Public()
  @HttpCode(200)
  @Post()
  @ApiResponse({
    status: 400,
    description: 'Email address not found.',
  })
  @ApiResponse({
    status: 401,
    description: 'Incorrect password.',
  })
  @ApiResponse({
    status: 200,
    type: SignInResponse,
  })
  async signIn(@I18n() i18n: I18nContext, @Body() body: SignInDto) {
    return await this.signInService.signIn(i18n, body);
  }
}
