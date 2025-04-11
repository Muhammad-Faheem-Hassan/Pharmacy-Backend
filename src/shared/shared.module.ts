import { Module, CacheModule, forwardRef } from "@nestjs/common";
import { AwsService } from "./services/aws/aws.service";
import { CacheService } from "./services/cache/cache.service";
import { EmailService } from "./services/email/email.service";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [
    CacheModule.register(),
    forwardRef(() => UserModule)
  ],
  providers: [AwsService, EmailService, CacheService],
  exports:[AwsService, EmailService, CacheService]
})
export class SharedModule {}
