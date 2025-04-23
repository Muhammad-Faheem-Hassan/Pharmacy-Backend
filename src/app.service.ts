import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CreateRoleDto } from './role/dto/create-role.dto';
import { RoleService } from './role/role.service';
import { CreateUserServiceDto } from './user/dto/create-user-service.dto';
import { UserService } from './user/user.service';
import * as fs from 'fs';
import { SettingService } from './setting/setting.service';
import { ESettingKeys } from './shared/enums/setting.enum';
import { CreateSettingDto } from './setting/dto/create-setting.dto';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private readonly roleService: RoleService, private readonly settingService: SettingService,
    private readonly userService: UserService) {
  }
  onApplicationBootstrap() {
    if (process.env.NODE_ENV === "development") {
      this.seedTheDb();
    }
  }


  async seedTheDb() {
    try {
      const IsDbSeeded = await this.settingService.findOneByKey(ESettingKeys.IsDbSeeded);
      
      if (IsDbSeeded) {
        return;
      }

      await this.roleService.truncateCollection();

      const permissions = [
        {
          module: "User",
          action: "Create",
          identifier: "UserCreate"
        },
        {
          module: "User",
          action: "Return",
          identifier: "UserReturn"
        },
        {
          module: "User",
          action: "Delete",
          identifier: "UserDelete"
        },
        {
          module: "User",
          action: "Update",
          identifier: "UserUpdate"
        },

        {
          module: "Role",
          action: "Return",
          identifier: "RoleReturn"
        },
        {
          module: "Role",
          action: "Create",
          identifier: "RoleCreate"
        },
        {
          module: "Role",
          action: "Update",
          identifier: "RoleUpdate"
        },
        {
          module: "Role",
          action: "Delete",
          identifier: "RoleDelete"
        }
      ];

      const adminRole: CreateRoleDto = {
        name: "Admin",
        isPublic: false,
        identifier: "admin",
        permissions: permissions.map((x) => x.identifier),
        isDeleteAble: false
      };

      await this.roleService.createManyPermissions(permissions);
      await this.roleService.create(adminRole);
  
      const insertedAdminRole = await this.roleService.findAll({ identifier: adminRole.identifier });
      const adminUser: CreateUserServiceDto = {
        fName: "Super",
        lName: "Admin",
        email: "admin@test.com",
        password: "hello@12",
        phone:"+923086011481",
        cnic:"320230320-",
        RoleId: insertedAdminRole[0]._id,
      }
      await this.userService.create(adminUser);

      const settings: CreateSettingDto[] = [
        {
          title: "Flag For Db Seed Status",
          key: ESettingKeys.IsDbSeeded,
          value: true.toString(),
          priority: 0,
          type: "",
          config: null,
          isInternal: true
        }
      ];
      await this.settingService.createMany(settings);

      // GEO LOCATIONS INSERTION BELOW 
      let countriesJson = [];
      if (!fs.existsSync("./src/shared/seeds/countries.json")) {
        return false;
      }
    } catch (error) {
      console.log("--------------->", error);
    }
  }
}
