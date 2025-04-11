import { IsNotEmpty, IsUUID } from "class-validator";

export class VerifyUuidDto {
  @IsNotEmpty()
  readonly verification: string;

  @IsNotEmpty()
  readonly email: string;
}
