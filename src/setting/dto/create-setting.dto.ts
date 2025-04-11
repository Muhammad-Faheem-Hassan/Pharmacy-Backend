import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateSettingDto {
  @MaxLength(100)
  @IsOptional()
  title: string;

  @IsOptional()
  @MaxLength(100)
  key: string;

  @IsOptional()
  @IsString()
  value: string;

  @IsOptional()
  @IsNumber()
  priority: number;

  @IsOptional()
  @MaxLength(50)
  type: string;

  @IsOptional()
  @IsOptional()
  config: object;

  @IsOptional()
  @IsBoolean()
  isInternal: boolean;
}
