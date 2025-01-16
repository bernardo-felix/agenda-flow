import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(id: string) {
    return this.jwtService.sign({ id });
  }

  async verifyRefreshToken(refreshToken: string) {
    return this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
    });
  }

  async generateRefreshToken(id: string) {
    return this.jwtService.sign(
      { id },
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      },
    );
  }
}
