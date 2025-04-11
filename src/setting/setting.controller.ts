import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
} from "@nestjs/common";
import { SettingService } from "./setting.service";
import { UpdateSettingDto } from "./dto/update-setting.dto";
import { CreateSettingDto } from "./dto/create-setting.dto";

@Controller("setting")
export class SettingController {
  constructor(private readonly settingService: SettingService) { }

  @Post()
  create(@Body() CreateSettingDto: CreateSettingDto) {
    return this.settingService.create(CreateSettingDto);
  }

  @Get()
  findAll() {
    return this.settingService.findAll();
  }

  @Get(":key")
  findOne(@Param("key") key: string) {
    return this.settingService.findOneByKey(key);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingService.update(id, updateSettingDto);
  }
}
