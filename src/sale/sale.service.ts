import { Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale, SaleDocument } from './entities/sale.entity';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateMedicineDto } from 'src/medicines/dto/create-medicine.dto';
import { MedicinesService } from 'src/medicines/medicines.service';
import { GetSaleDto } from './dto/get-sale.dto';

@Injectable()
export class SaleService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    private readonly medicinesService: MedicinesService,
  ) { }
  create(createSaleDto: CreateSaleDto) {
    const itemsWithObjectIds = createSaleDto.items.map(item => ({
      ...item,
      medicine: new Types.ObjectId(item.medicine),
    }));

    if (createSaleDto.type === 'SALE') {
      createSaleDto.items.map(item => {
        const medicineId = item.medicine.toString();
        this.medicinesService.decreaseStock(medicineId, item.quantity);
      });
    } else if (createSaleDto.type === 'RETURN') {
      createSaleDto.items.map(item => {
        const medicineId = item.medicine.toString();
        this.medicinesService.increaseStock(medicineId, item.quantity);
      });
    }


    const purchaseToSave = {
      ...createSaleDto,
      items: itemsWithObjectIds,
    };

    return this.saleModel.create(purchaseToSave);
  }

  async findAll(getDto: GetSaleDto) {
    const limit = Number(getDto.l) || 10;
    const skip = Number(getDto.s) || 0;

    const match: any = {};


    const dataPromise = this.saleModel.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'medicines',
          localField: 'items.medicine',
          foreignField: '_id',
          as: 'medicineDetails',
        },
      },
      {
        $addFields: {
          'items.medicine': { $arrayElemAt: ['$medicineDetails', 0] },
        },
      },
      {
        $group: {
          _id: '$_id',
          customer: { $first: '$customer' },
          type: { $first: '$type' },
          date: { $first: '$date' },
          totalAmount: { $first: '$totalAmount' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          items: { $push: '$items' },
        },
      },
    ]).exec();

    const countPromise = this.saleModel.countDocuments(match);

    const [data, totalRecord] = await Promise.all([dataPromise, countPromise]);
    console.log(data.length);
    
    return {
      data,
      totalRecord,
    };
  }

  // Give all data populated
  findOne(id: string) {
    return this.saleModel.findById(id).populate('items.medicine');
  }

  update(id: number, updateSaleDto: UpdateSaleDto) {
    return `This action updates a #${id} sale`;
  }

  remove(id: number) {
    return `This action removes a #${id} sale`;
  }
}
