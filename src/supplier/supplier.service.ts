import { Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Supplier, SupplierDocument } from './entities/supplier.entity';
import { Model } from 'mongoose';
import { Public } from 'src/auth/guards/roles.guard';

@Injectable()
export class SupplierService {
  constructor(@InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>) { }

  @Public()
  create(createSupplierDto: CreateSupplierDto) {
    return this.supplierModel.create(createSupplierDto);
  }

  @Public()
  findAll() {
    return this.supplierModel.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} supplier`;
  }

  update(id: number, updateSupplierDto: UpdateSupplierDto) {
    return `This action updates a #${id} supplier`;
  }

  remove(id: number) {
    return `This action removes a #${id} supplier`;
  }
}
