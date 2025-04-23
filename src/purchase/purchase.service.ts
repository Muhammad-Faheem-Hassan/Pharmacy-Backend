import { Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Purchase, PurchaseDocument } from './entities/purchase.entity';
import { Model, Types } from 'mongoose';
import { MedicinesService } from 'src/medicines/medicines.service';
import { th } from 'date-fns/locale';
import { CreateMedicineDto } from 'src/medicines/dto/create-medicine.dto';
import { GetPurchaseDto } from './dto/get-purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
    private readonly medicinesService: MedicinesService,
  ) { }
  async create(createPurchaseDto: CreatePurchaseDto) {
    const itemsWithObjectIds = createPurchaseDto.items.map(item => ({
      ...item,
      medicine: new Types.ObjectId(item.medicine),
    }));
    const medicineDto = new CreateMedicineDto
    if (createPurchaseDto.type === 'PURCHASE') {
      createPurchaseDto.items.map(item => {
        const medicineId = item.medicine.toString();
        this.medicinesService.increaseStock(medicineId, item.quantity);
        medicineDto.purchasePrice = item.price;
        medicineDto.salePrice = item.salePrice;
        this.medicinesService.update(medicineId, medicineDto);
      });
    } else if (createPurchaseDto.type === 'RETURN') {
      createPurchaseDto.items.map(item => {
        const medicineId = item.medicine.toString();
        this.medicinesService.decreaseStock(medicineId, item.quantity);
      });
    }


    const purchaseToSave = {
      ...createPurchaseDto,
      supplierId: new Types.ObjectId(createPurchaseDto.supplierId),
      items: itemsWithObjectIds,
    };

    return this.purchaseModel.create(purchaseToSave);
  }

  async findAll(getDto: GetPurchaseDto) {
    const limit = Number(getDto.l) || 10;
    const skip = Number(getDto.o) || 0;

    const match: any = {};
    if (getDto.startDate) {
      match.createdAt = { ...(match.createdAt || {}), $gte: new Date(getDto.startDate) };
    }

    if (getDto.endDate) {
      match.createdAt = { ...(match.createdAt || {}), $lte: new Date(getDto.endDate) };
    }

    if (getDto.type) {
      match.type = getDto.type;
    }

    const pipeline: any[] = [
      { $match: match },
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
    ];

    // Group by original purchase document
    pipeline.push(
      {
        $group: {
          _id: '$_id',
          supplierId: { $first: '$supplierId' },
          date: { $first: '$date' },
          type: { $first: '$type' },
          totalAmount: { $first: '$totalAmount' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          items: { $push: '$items' },
        },
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplierInfo',
        },
      },
      { $unwind: '$supplierInfo' },
      {
        $addFields: {
          supplier: '$supplierInfo',
        },
      },
      { $project: { supplierInfo: 0 } },
      { $sort: { createdAt: 1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const data: any = await this.purchaseModel.aggregate(pipeline);

    // For total count (without pagination/skip/limit)
    const countPipeline = [...pipeline];

    // Remove pagination stages for count
    const withoutPagination = countPipeline.filter(stage => {
      return !('$skip' in stage) && !('$limit' in stage) && !('$sort' in stage);
    });

    withoutPagination.push({ $count: 'total' });

    const countResult = await this.purchaseModel.aggregate(withoutPagination);
    const total = countResult[0]?.total || 0;

    return { data, total };
  }

  findOne(id: string) {
    return this.purchaseModel.findById(id).populate('items.medicine').populate("supplierId");
  }

  update(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    return `This action updates a #${id} purchase`;
  }

  remove(id: number) {
    return `This action removes a #${id} purchase`;
  }
}
