import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { Medicine, MedicineDocument } from './entities/medicine.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetMedicineDto } from './dto/get-medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(@InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>) {

  }

  create(createMedicineDto: CreateMedicineDto) {
    return this.medicineModel.create(createMedicineDto);
  }

  async findAll(getDto: GetMedicineDto) {
    const { l, o, s } = getDto;
  
    const filter: any = {};
    if (s) {
      filter.$or = [
        { name: { $regex: s, $options: 'i' } },
        { batchNumber: { $regex: s, $options: 'i' } }
      ];
    }
  
    const [data, totalRecords] = await Promise.all([
      this.medicineModel
        .find(filter)
        .skip(Number(o) || 0)
        .limit(Number(l) || 10)
        .exec(),
      this.medicineModel.countDocuments(filter).exec()
    ]);
  
    return {
      totalRecords,
      data
    };
  }

  findOne(id: string) {
    return this.medicineModel.findById(id).exec();
  }

  update(id: string, updateMedicineDto: UpdateMedicineDto) {
    return this.medicineModel.findByIdAndUpdate(id, updateMedicineDto, { new: true }).exec();
  }

  remove(id: number) {
    return `This action removes a #${id} medicine`;
  }

  increaseStock(id: string, quantity: number) {
    return this.medicineModel.findByIdAndUpdate(id, { $inc: { quantity: quantity } }, { new: true }).exec();
  };

  async decreaseStock(id: string, quantity: number) {
    if (quantity < 0) {
      return
    }

    if (quantity > (await this.findOne(id)).quantity) {
      // throw new BadRequestException('Not enough stock');
      return
    }
    return this.medicineModel.findByIdAndUpdate(id, { $inc: { quantity: -quantity } }, { new: true }).exec();
  };
}
