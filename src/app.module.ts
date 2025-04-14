import { Module } from "@nestjs/common";
import { MongooseModule, MongooseModuleOptions } from "@nestjs/mongoose";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { RoleModule } from "./role/role.module";
import { SharedModule } from "./shared/shared.module";
import { AppService } from "./app.service";
import { RolesGuard } from "./auth/guards/roles.guard";
import configuration from './env';
import { SettingModule } from "./setting/setting.module";
import { PurchaseModule } from './purchase/purchase.module';
import { MedicinesModule } from './medicines/medicines.module';
import { SupplierModule } from './supplier/supplier.module';
import { SaleModule } from './sale/sale.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        console.log(configService.get<MongooseModuleOptions>('mongo_db_uri'));
        return {
          uri: configService.get<MongooseModuleOptions>('mongo_db_uri')
        };
      },
      inject: [ConfigService],
    }),
    SettingModule,
    UserModule,
    RoleModule,
    AuthModule,
    SharedModule,
    PurchaseModule,
    MedicinesModule,
    SupplierModule,
    SaleModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AppService,
  ],
})
export class AppModule { }
