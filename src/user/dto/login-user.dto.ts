import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsString,
  IsOptional
} from "class-validator";

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(1024)
  readonly password?: string;
}
