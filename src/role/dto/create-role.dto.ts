import {
  IsNumber,
  IsNotEmpty,
  IsArray,
  MaxLength,
  IsBoolean,
  IsOptional,
} from "class-validator";
export class CreateRoleDto {
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
  
  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;
  
  @IsOptional()
  @IsArray()
  permissions: string[];

  isDeleteAble: boolean;

  @IsOptional()
  @MaxLength(50)
  identifier?: string;
}
