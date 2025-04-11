import { IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateMedicineDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    batchNumber: string;

    @IsString()
    @IsNotEmpty()
    expiryDate: Date;

    @IsString()
    @IsOptional()
    quantity: number;

    @IsString()
    @IsOptional()
    purchasePrice: number;

    @IsString()
    @IsOptional()
    salePrice: number;
}
