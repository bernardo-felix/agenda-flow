import { expect, Mock, test } from 'vitest';
import { RegisterService } from './register.service';
import { People } from '@/db/postgres/entities/people.entity';
import { PgService } from '@/db/postgres/postgres.service';
import { RegisterDto } from '../dto/register.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as argon2 from 'argon2'; // Assuming argon2 is mocked or stubbed

const newUser: RegisterDto = {
  email: 'test@email.com',
  name: 'Test User',
  password: 'test123',
};

describe('RegisterService', () => {
  let service: RegisterService;
  const mockPgService = {
    execute: vi.fn(),
  } as unknown as PgService;

  vi.mock('argon2', () => ({
    hash: vi.fn(),
  }));

  beforeEach(() => {
    service = new RegisterService(mockPgService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should register a new user successfully', async () => {
    (mockPgService.execute as Mock).mockResolvedValueOnce([]); // No existing users
    (argon2.hash as Mock).mockResolvedValueOnce('hashedPassword'); // Mock hashed password

    await service.register(newUser);

    expect(mockPgService.execute).toHaveBeenCalledWith(
      'SELECT * FROM people WHERE email = $1',
      [newUser.email.toUpperCase()],
    );

    expect(mockPgService.execute).toHaveBeenCalledTimes(2); // Verify both calls

    expect(argon2.hash).toHaveBeenCalledWith(newUser.password); // Verify password hashing

    expect(mockPgService.execute).toHaveBeenCalledWith(
      'INSERT INTO people (name, email, password) VALUES ($1, $2, $3)',
      [
        newUser.name.toUpperCase(),
        newUser.email.toUpperCase(),
        'hashedPassword', // Use the mocked hashed password
      ],
    );
  });

  test('should throw an error if email already exists', async () => {
    const existingUsers: People[] = [
      {
        id: 'asdas',
        ...newUser,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    (mockPgService.execute as Mock).mockResolvedValueOnce(existingUsers);

    await expect(service.register(newUser)).rejects.toThrowError(
      new HttpException('Email já cadastrado', HttpStatus.BAD_REQUEST),
    );
  });
});
