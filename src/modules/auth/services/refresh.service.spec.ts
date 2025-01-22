import { expect, Mock, test, vi } from 'vitest';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RefreshService } from './refresh.service'; // Assuming your RefreshService is in the same directory
import { TokenService } from './token.service'; // Assuming your TokenService is in the same directory

vi.mock('./token.service'); // Mock TokenService

describe('RefreshService', () => {
  let service: RefreshService;
  let mockTokenService: TokenService;

  beforeEach(() => {
    mockTokenService = {
      verifyRefreshToken: vi.fn(),
      generateAccessToken: vi.fn(),
      generateRefreshToken: vi.fn(),
    } as unknown as TokenService;
    service = new RefreshService(mockTokenService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Deve atualizar o token com sucesso', async () => {
    const refreshToken = 'valid-refresh-token';
    const userId = 'user-id';
    const newAccessToken = 'new-access-token';
    const newRefreshToken = 'new-refresh-token';

    (mockTokenService.verifyRefreshToken as Mock).mockResolvedValueOnce({
      id: userId,
    });
    (mockTokenService.generateAccessToken as Mock).mockResolvedValueOnce(
      newAccessToken,
    );
    (mockTokenService.generateRefreshToken as Mock).mockResolvedValueOnce(
      newRefreshToken,
    );

    const response = await service.refresh({ refreshToken });

    expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith(
      refreshToken,
    );
    expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith(userId);
    expect(mockTokenService.generateRefreshToken).toHaveBeenCalledWith(userId);
    expect(response).toEqual({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });

  test('Deve lançar erro para refresh token inválido', async () => {
    const refreshToken = 'invalid-refresh-token';

    (mockTokenService.verifyRefreshToken as Mock).mockResolvedValueOnce(null);

    await expect(service.refresh({ refreshToken })).rejects.toThrowError(
      new HttpException('refresh token invalido', HttpStatus.UNAUTHORIZED),
    );

    expect(mockTokenService.generateAccessToken).not.toHaveBeenCalled();
    expect(mockTokenService.generateRefreshToken).not.toHaveBeenCalled();
  });
});
