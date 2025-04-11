import {
    IsBoolean,
    // IsNumber,
    IsNotEmpty,
   
  } from "class-validator";
  
  export class ValidateAccessTokenDto {
    @IsNotEmpty()
    vimeoAccessToken: string;
  
   }
  