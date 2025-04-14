import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { Sale, SaleSchema } from './entities/sale.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicinesModule } from 'src/medicines/medicines.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]), MedicinesModule],
  controllers: [SaleController],
  providers: [SaleService]
})
export class SaleModule { }
