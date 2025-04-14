import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Public } from 'src/auth/guards/roles.guard';
import { GetSaleDto } from './dto/get-sale.dto';

@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Public()
  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.saleService.create(createSaleDto);
  }

  @Public()
  @Get()
  findAll(@Query() getDto: GetSaleDto) {
    console.log(getDto);
    
    return this.saleService.findAll(getDto);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.saleService.update(+id, updateSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.saleService.remove(+id);
  }
}
