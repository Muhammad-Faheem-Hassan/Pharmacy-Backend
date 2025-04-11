import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsDateString,
  IsBoolean,
} from "class-validator";
import { Types } from "mongoose";

export class CreateUserServiceDto {
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  fName: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lName: string;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  phone: string;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  cnic: string;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  password: string;

  @IsNotEmpty()
  RoleId: string;

  @IsOptional()
  @MaxLength(500)
  profilePicture?: string;

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @IsOptional()
  @IsDateString()
  expiry?: Date; 
}
