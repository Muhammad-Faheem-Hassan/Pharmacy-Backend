import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from "@nestjs/common";
import { RoleService } from "./role.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Public } from "../auth/guards/roles.guard";
@Controller("role")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Public()
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    createRoleDto.isDeleteAble = true;
    return this.roleService.create(createRoleDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Public()
  @Get("all-permissions")
  findAllPermissions() {
    return this.roleService.findAllPermissions();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
    delete updateRoleDto.isDeleteAble;
    delete updateRoleDto.identifier;

    if (Object.keys(updateRoleDto).length == 0) {
      throw new BadRequestException("Please provide data to update");        
    }
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.roleService.remove(id);
  }
}
