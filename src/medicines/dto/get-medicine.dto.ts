import { IsString, IsOptional } from "class-validator";
import { GetApiDto } from "../../shared/dto/get-api.dto";

export class GetMedicineDto extends GetApiDto {

  @IsOptional()
  @IsString()
  isDeleted: true | false;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;

  constructor() {
    super();
    this.sb = "name";
    this.sd = "1";
  }

}