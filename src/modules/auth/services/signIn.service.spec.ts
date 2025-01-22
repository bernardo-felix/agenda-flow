import { expect, Mock, test, vi } from 'vitest';
import { SignInService } from './signIn.service';
import { People } from '@/db/postgres/entities/people.entity';
import { PgService } from '@/db/postgres/postgres.service';
import { SignInDto } from '../dto/signIn.dto';
import * as argon2 from 'argon2';
import { TokenService } from './token.service';
import { I18nContext } from 'nestjs-i18n';
import { RedisService } from '@/db/redis/redis.service';
import keys from '@/db/redis/keys';

describe('SignInService', () => {
  let service: SignInService;
  let mockPgService: PgService;
  let mockRedisService: RedisService;
  let mockTokenService: TokenService;
  const mockI18nContext = { t: vi.fn() } as unknown as I18nContext;

  vi.mock('argon2', () => ({ verify: vi.fn() }));
  vi.mock('./token.service');
  vi.mock('@/db/redis/redis.service');

  beforeEach(() => {
    mockPgService = { execute: vi.fn() } as unknown as PgService;
    mockRedisService = {
      getKey: vi.fn(),
      setKey: vi.fn(),
    } as unknown as RedisService;
    mockTokenService = {
      generateAccessToken: vi.fn(),
      generateRefreshToken: vi.fn(),
    } as unknown as TokenService;

    service = new SignInService(
      mockPgService,
      mockTokenService,
      mockRedisService,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Deve logar com sucesso usando usuário em cache (Redis)', async () => {
    const existingUser: People = {
      id: 'user-id',
      email: 'test@email.com',
      password: 'hashedPassword',
    } as People;
    const signInDto: SignInDto = {
      email: existingUser.email,
      password: 'validPassword',
    };

    (mockRedisService.getKey as Mock).mockResolvedValueOnce(
      JSON.stringify([existingUser]),
    );
    (argon2.verify as Mock).mockResolvedValueOnce(true); // Opcional se você mockou argon2
    (mockTokenService.generateAccessToken as Mock).mockResolvedValueOnce(
      'access-token',
    );
    (mockTokenService.generateRefreshToken as Mock).mockResolvedValueOnce(
      'refresh-token',
    );

    const response = await service.signIn(mockI18nContext, signInDto);

    expect(mockRedisService.getKey).toHaveBeenCalledWith(
      [...keys.PERSON.INFO, existingUser.email].join(';'),
    );
    expect(mockPgService.execute).not.toHaveBeenCalled();
    // ... outras asserções

    expect(response).toEqual({
      token: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  // ... outros testes
});
