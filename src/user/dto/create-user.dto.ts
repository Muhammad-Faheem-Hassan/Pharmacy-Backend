import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsDateString,
  IsBoolean
} from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  readonly fName: string;

  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  readonly lName: string;

  @IsOptional()
  @MinLength(5)
  @MaxLength(255)
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @MinLength(5)
  @MaxLength(255)
  readonly phone: string;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  readonly password: string;

  @IsNotEmpty()
  RoleId: string;

  @IsOptional()
  role: string;

  @IsOptional()
  cnic: string;

  @IsOptional()
  @MaxLength(500)
  readonly profilePicture: string;

  @IsOptional()
  @IsBoolean()
  readonly isBlocked?: boolean;

  @IsOptional()
  @IsDateString()
  readonly expiry?: Date; 
}
