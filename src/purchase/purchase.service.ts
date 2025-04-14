import { Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Purchase, PurchaseDocument } from './entities/purchase.entity';
import { Model, Types } from 'mongoose';
import { MedicinesService } from 'src/medicines/medicines.service';
import { th } from 'date-fns/locale';
import { CreateMedicineDto } from 'src/medicines/dto/create-medicine.dto';

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
    createPurchaseDto.items.map(item => {
      const medicineId = item.medicine.toString();
      this.medicinesService.increaseStock(medicineId, item.quantity);
      medicineDto.purchasePrice = item.price;
      this.medicinesService.update(medicineId, medicineDto);
    });
    
    const purchaseToSave = {
      ...createPurchaseDto,
      supplierId: new Types.ObjectId(createPurchaseDto.supplierId),
      items: itemsWithObjectIds,
    };

    return this.purchaseModel.create(purchaseToSave);
  }

  async findAll(): Promise<any[]> {
    return this.purchaseModel.aggregate([
      // Unwind items array
      { $unwind: '$items' },
  
      // Lookup medicine details
      {
        $lookup: {
          from: 'medicines',
          localField: 'items.medicine',
          foreignField: '_id',
          as: 'medicineDetails'
        }
      },
  
      // Merge medicine details into items.medicine
      {
        $addFields: {
          'items.medicine': { $arrayElemAt: ['$medicineDetails', 0] }
        }
      },
  
      // Group back all items per purchase
      {
        $group: {
          _id: '$_id',
          supplierId: { $first: '$supplierId' },
          date: { $first: '$date' },
          totalAmount: { $first: '$totalAmount' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          items: { $push: '$items' }
        }
      },
  
      // Lookup supplier info
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplierInfo'
        }
      },
      { $unwind: '$supplierInfo' },
  
      // Optional: Replace `supplierId` with full supplier info
      {
        $addFields: {
          supplier: '$supplierInfo'
        }
      },
      { $project: { supplierInfo: 0 } }, // Remove raw supplierInfo if not needed
  
      // Sort by newest first
      { $sort: { createdAt: -1 } }
    ]);
  }

  findOne(id: number) {
    return `This action returns a #${id} purchase`;
  }

  update(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    return `This action updates a #${id} purchase`;
  }

  remove(id: number) {
    return `This action removes a #${id} purchase`;
  }
}
