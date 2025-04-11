import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches
} from "class-validator";

export class ChangePasswordDto {
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  readonly password: string;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  readonly newPassword: string;
}
