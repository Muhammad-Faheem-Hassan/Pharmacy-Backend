import { BadRequestException, CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CacheService } from "../shared/services/cache/cache.service";
import { UtilService } from "../shared/services/util/util.service";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Permission, PermissionDocument } from "./entities/permission.entity";
import { Role, RoleDocument } from "./entities/role.entity";

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name) private readonly permissionModel: Model<PermissionDocument>,
    private readonly cacheService: CacheService
  ) {}

  create(createRoleDto: CreateRoleDto) {
    createRoleDto.identifier = UtilService.generateAnId(20)
    const createRole = new this.roleModel(createRoleDto);
    return createRole.save();
  }

  findAll(where = {}) {
    return this.roleModel.find(where).exec();
  }

  async findOne(id: string) {
    try {
      return await this.roleModel.findById(id).exec();
    } catch (error) {
      throw new BadRequestException("The id is invalid");
    };
  }

  async findOneByIdentifier(identifier: string) {
    try {
      return await this.roleModel.findOne({
        identifier
      }).exec();
    } catch (error) {
      throw new BadRequestException("Role does not exist");
    };
  }

  async findOneCached(id: string) {
    try {
      let role;
      role = await this.cacheService.get(id);
      if (!role) {
        role = await this.findOne(id);
        await this.cacheService.set(id, role);
      }

      return role;
    } catch (error) {
      throw new BadRequestException("The id is invalid");
    };
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    try {
      await this.roleModel.updateOne({ _id: id }, updateRoleDto).exec();
      await this.cacheService.set(id, (await this.findOne(id)));
      return "Record updated successfully";
    } catch (error) {
      throw new BadRequestException("Record could not be updated");
    };
  }

  async remove(id: string) {
    try {
      await this.roleModel.deleteOne({ _id: id, isDeleteAble: true }).exec();
      await this.cacheService.delete(id);
      return "Record deleted successfully";
    } catch (error) {
      throw new BadRequestException("Record could not be deleted");
    };
  }

  async createManyRoles(createRolesDto: CreateRoleDto[]) {
    return await this.roleModel.insertMany(createRolesDto);
  }

  async createManyPermissions(createPermissionsDto: CreatePermissionDto[]) {
    return await this.permissionModel.insertMany(createPermissionsDto);
  }

  findAllPermissions() {
    return this.permissionModel.find().exec();
  }

  async truncateCollection() {
    if (process.env.NODE_ENV !== "TakeOff") {
      return;
    }
    return await this.permissionModel.deleteMany({})
  }
}
