import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Mock, vi } from 'vitest';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn(),
            verify: vi.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', async () => {
      const userId = 'test-user-id';
      const expectedToken = 'test-access-token';
      (jwtService.sign as Mock).mockReturnValue(expectedToken);

      const token = await service.generateAccessToken(userId);

      expect(jwtService.sign).toHaveBeenCalledWith({ id: userId });
      expect(token).toBe(expectedToken);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a refresh token', async () => {
      const refreshToken = 'test-refresh-token';
      const expectedPayload = { id: 'test-user-id' };
      const secret = 'test-secret';
      (configService.get as Mock).mockReturnValue(secret);
      (jwtService.verify as Mock).mockResolvedValue(expectedPayload);

      const payload = await service.verifyRefreshToken(refreshToken);
      expect(configService.get).toHaveBeenCalledWith('REFRESH_TOKEN_SECRET');
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, { secret });
      expect(payload).toEqual(expectedPayload);
    });

    it('should return null if token is invalid', async () => {
      const refreshToken = 'invalid-refresh-token';
      const secret = 'test-secret';
      (configService.get as Mock).mockReturnValue(secret);

      const payload = await service.verifyRefreshToken(refreshToken);

      expect(configService.get).toHaveBeenCalledWith('REFRESH_TOKEN_SECRET');
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, { secret });
      expect(payload).toBeUndefined();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token', async () => {
      const userId = 'test-user-id';
      const expectedToken = 'test-refresh-token';
      const secret = 'test-secret';
      (configService.get as Mock).mockReturnValue(secret);
      (jwtService.sign as Mock).mockReturnValue(expectedToken);

      const token = await service.generateRefreshToken(userId);

      expect(configService.get).toHaveBeenCalledWith('REFRESH_TOKEN_SECRET');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { id: userId },
        {
          secret,
          expiresIn: '7d',
        },
      );
      expect(token).toBe(expectedToken);
    });
  });
});
