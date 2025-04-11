import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateSettingDto } from "./dto/create-setting.dto";
import { UpdateSettingDto } from "./dto/update-setting.dto";
import { Setting, SettingDocument } from "./entities/setting.entity";
import axios from "axios";
import { ValidateAccessTokenDto } from "./dto/validateAccessTokenDto";

@Injectable()
export class SettingService {
  constructor(
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>
  ) {}

  create(createSettingDto: CreateSettingDto) {
    const newSetting = new this.settingModel(createSettingDto);
    return newSetting.save();
  }

  findAll(where = {}) {
    return this.settingModel.find(where).exec();
  }

  findOne(id: string) {
    return this.settingModel.findById(id).exec();
  }

  findOneByKey(key: string) {
    return this.settingModel.findOne({ key }).exec();
  }

  update(id: string, updateSettingDto: UpdateSettingDto) {
    return this.settingModel.updateOne({ _id: id }, updateSettingDto).exec();
  }

  async createMany(records: CreateSettingDto[]) {
    return await this.settingModel.insertMany(records);
  }

  async truncateCollection() {
    if (process.env.NODE_ENV !== "TakeOff") {
      return;
    }
    return await this.settingModel.deleteMany({});
  }
}
