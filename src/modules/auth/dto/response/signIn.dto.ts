import { IsString } from 'class-validator';

export class SignInResponse {
  @IsString()
  token: string;
  @IsString()
  refreshToken: string;
}
