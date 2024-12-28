import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(id: string) {
    return this.jwtService.sign({ id });
  }

  async verifyRefreshToken(refreshToken: string) {
    return this.jwtService.verify(refreshToken, { secret: 'refresh' });
  }

  async generateRefreshToken(id: string) {
    return this.jwtService.sign({ id }, { secret: 'refresh', expiresIn: '7d' });
  }
}
