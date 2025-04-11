import { IsNotEmpty, MaxLength } from "class-validator";
export class CreatePermissionDto {
  @IsNotEmpty()
  @MaxLength(50)
  module: string;

  @IsNotEmpty()
  @MaxLength(50)
  action: string;

  @IsNotEmpty()
  @MaxLength(100)
  identifier: string; 
}
