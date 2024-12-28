import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { TokenService } from './token.service';
import { RefreshDto } from '../dto/refresh.dto';

@Injectable()
export class RefreshService {
  constructor(private readonly tokenService: TokenService) {}

  async refresh({ refreshToken }: RefreshDto) {
    const tokenInfo: { id: string } =
      await this.tokenService.verifyRefreshToken(refreshToken);

    if (!tokenInfo)
      throw new HttpException(
        'refresh token invalido',
        HttpStatus.UNAUTHORIZED,
      );

    return {
      token: await this.tokenService.generateAccessToken(tokenInfo.id),
      refreshToken: await this.tokenService.generateRefreshToken(tokenInfo.id),
    };
  }
}
