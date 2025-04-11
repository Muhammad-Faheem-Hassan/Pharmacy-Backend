import {
    IsNumber,
    IsNotEmpty,
    IsArray,
    MaxLength,
    IsBoolean,
    IsOptional,
  } from "class-validator";
  export class GetRoleDto {
    @IsOptional()
    @MaxLength(50)
    name: string;
    
    @IsOptional()
    @IsBoolean()
    isPublic: boolean;
    
    @IsOptional()
    @IsArray()
    permissions: string[];
  
    isDeleteAble: boolean;
  
    @IsOptional()
    @MaxLength(50)
    identifier?: string;

    @IsOptional()
    @MaxLength(50)
    departmentId: string;
  }
  