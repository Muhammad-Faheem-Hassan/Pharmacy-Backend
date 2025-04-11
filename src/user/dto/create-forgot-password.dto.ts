import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsString,
} from "class-validator";

export class CreateForgotPasswordDto {
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  @IsEmail()
  readonly email: string;
}
