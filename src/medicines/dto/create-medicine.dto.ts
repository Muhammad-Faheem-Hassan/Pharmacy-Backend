import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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

    @IsNumber()
    @IsOptional()
    quantity: number;

    @IsNumber()
    @IsOptional()
    purchasePrice: number;

    @IsNumber()
    @IsOptional()
    salePrice: number;
}
