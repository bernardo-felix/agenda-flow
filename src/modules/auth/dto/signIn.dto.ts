import { IsEmail, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class SignInDto {
  @IsEmail({}, { message: i18nValidationMessage('validation.INVALID_EMAIL') })
  @IsString()
  email: string;

  @IsString()
  password: string;
}
