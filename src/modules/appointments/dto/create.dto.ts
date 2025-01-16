import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class Infos {
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  @Transform(({ value }) => value.map((email: string) => email.toUpperCase()))
  emails: string[];

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}

export class CreateDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  scheduledAt?: Date;

  @ValidateNested()
  @Type(() => Infos)
  @IsNotEmpty()
  infos: Infos;
}
