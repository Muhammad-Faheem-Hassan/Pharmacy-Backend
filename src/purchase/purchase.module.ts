import { MongooseModule } from '@nestjs/mongoose';
import { Purchase, PurchaseSchema } from './entities/purchase.entity';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';
import { Module } from '@nestjs/common';
import { MedicinesModule } from 'src/medicines/medicines.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Purchase.name, schema: PurchaseSchema }]), MedicinesModule],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
