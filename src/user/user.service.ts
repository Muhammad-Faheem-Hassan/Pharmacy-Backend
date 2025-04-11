import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Request } from "express";
import { AuthService } from "./../auth/auth.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { Injectable, BadRequestException, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import mongoose from "mongoose";
import { addHours } from "date-fns";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from 'bcryptjs';
import * as CryptoJS from 'crypto-js';
import { CreateForgotPasswordDto } from "./dto/create-forgot-password.dto";
import { VerifyUuidDto } from "./dto/verify-uuid.dto";
import { RefreshAccessTokenDto } from "./dto/refresh-access-token.dto";
import { ForgotPassword } from "./interfaces/forgot-password.interface";
import { User } from "./interfaces/user.interface";
import { EmailService } from "../shared/services/email/email.service";
import { ResendVerificationDto } from "./dto/resend-verification.dto";
import { CreateUserServiceDto } from "./dto/create-user-service.dto";
import { RoleService } from "../role/role.service";
import { GetUserDto } from "./dto/get-user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateUserServiceDto } from "./dto/update-user-service.dto";

@Injectable()
export class UserService {
  HOURS_TO_VERIFY = 24;
  HOURS_TO_BLOCK = 6;
  LOGIN_ATTEMPTS_TO_BLOCK = 5;

  constructor(
    @InjectModel("User") private readonly userModel: Model<User>,
    @InjectModel("ForgotPassword") private readonly forgotPasswordModel: Model<ForgotPassword>,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private emailService: EmailService,
    private roleService: RoleService
  ) { }

  async signup(createUserServiceDto: CreateUserServiceDto): Promise<any> {
    try {
      const user = new this.userModel(createUserServiceDto);
      await this.isEmailUnique(user.email);
      this.setVerificationInfo(user);
      await user.save();

      const emailBody = this.emailService.loadTemplate("account-verification", user);
      await this.emailService.sendUsingSendGrid(user.email, "Account Verification", emailBody, emailBody);

      return {
        fName: user.fName,
        lName: user.lName,
        email: user.email,
        verified: user.verified,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async resendAccountVerificationEmail(resendVerificationDto: ResendVerificationDto): Promise<any> {
    const user = await this.userModel.findOne({ email: resendVerificationDto.email });
    if (!user) {
      throw new NotFoundException("Email not found");
    }

    this.setVerificationInfo(user);
    await user.save();

    const emailBody = this.emailService.loadTemplate("account-verification", user);
    await this.emailService.sendUsingSendGrid(user.email, "Account Verification", emailBody, emailBody);

    return {
      email: user.email,
      success: 1
    };
  }

  async verifyEmail(req: Request, verifyUuidDto: VerifyUuidDto) {
    try {
      const user = await this.userModel.findOne({
        verification: verifyUuidDto.verification,
        verified: false,
        verificationExpires: { $gt: new Date() },
      });
      if (!user) {
        throw new BadRequestException("Invalid or expired link.");
      }

      user.verified = true;
      user.verification = "";
      user.verificationExpires = null;
      await user.save();

      return {
        id: user._id,
        fName: user.fName,
        lName: user.lName,
        email: user.email,
        RoleId: user.RoleId,
        accessToken: await this.authService.createAccessToken(user._id, user.departmentId),
        refreshToken: await this.authService.createRefreshToken(req, user._id, user.departmentId),
      };
    } catch (error) {
      throw new BadRequestException("Invalid or expired link.");
    }
  }

  async loginByOtp(req: Request, loginUserDto: LoginUserDto, otp: any) {
    try {
      const user = await this.userModel.findOne({ email: loginUserDto.email });
      if (!user) {
        throw new NotFoundException("Invalid email or password.");
      }

      await this.forgotPasswordVerify(req, { email: loginUserDto.email, verification: otp })

      if (!user.verified) {
        throw new BadRequestException("Please verify you account", "verify-account");
      }

      if (user.isBlocked) {
        throw new BadRequestException("Please reset password", "account-blocked");
      }

      user.loginAttempts = 0;
      await user.save();

      const role = await this.roleService.findOneCached(user.RoleId);
      return {
        id: user._id,
        fName: user.fName,
        lName: user.lName,
        email: user.email,
        profilePicture: user.profilePicture || "",
        RoleId: user.RoleId,
        role: role ? role.identifier : "",
        permissions: role ? role.permissions : [],
        verified: user.verified,
        isBlocked: user.isBlocked,
        accessToken: await this.authService.createAccessToken(user._id, user.departmentId),
        refreshToken: await this.authService.createRefreshToken(req, user._id, user.departmentId),
      };
    } catch (error) {
      console.log("login catch", error)
      throw new NotFoundException("Invalid email or password.");
    }
  }

  async login(req: Request, loginUserDto: LoginUserDto) {
    try {
      const user = await this.userModel.findOne({ email: loginUserDto.email });
      if (!user) {
        throw new NotFoundException("Invalid email or password.");
      }

      const isPasswordMatched = await this.isPasswordMatched(loginUserDto.password, user.password);
      if (!isPasswordMatched) {
        user.loginAttempts += 1;
        if (user.loginAttempts >= this.LOGIN_ATTEMPTS_TO_BLOCK) {
          user.isBlocked = true;
        }

        if (user.isBlocked) {
          throw new BadRequestException("Please reset password", "account-blocked");
        }

        await user.save();
        throw new NotFoundException("Invalid email or password.");
      }

      if (!user.verified) {
        throw new BadRequestException("Please verify your account", "verify-account");
      }

      if (user.isBlocked) {
        throw new BadRequestException("Please reset password", "account-blocked");
      }
      user.loginAttempts = 0;
      await user.save();

      const role = await this.roleService.findOneCached(user.RoleId);
      return {
        id: user._id,
        fName: user.fName,
        lName: user.lName,
        email: user.email,
        profilePicture: user.profilePicture || "",
        RoleId: user.RoleId,
        role: role ? role.identifier : "",
        permissions: role ? role.permissions : [],
        verified: user.verified,
        isBlocked: user.isBlocked,
        departmentId: user.departmentId,
        accessToken: await this.authService.createAccessToken(user._id, user.departmentId),
        refreshToken: await this.authService.createRefreshToken(req, user._id, user.departmentId),
      };
    } catch (error) {
      console.log("login catch", error);
      throw new NotFoundException("Invalid email or password.");
    }
  }


  async refreshAccessToken(refreshAccessTokenDto: RefreshAccessTokenDto) {
    const userId = await this.authService.findRefreshToken(
      refreshAccessTokenDto.refreshToken
    );
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException("Bad request");
    }
    return {
      accessToken: await this.authService.createAccessToken(user._id, user.departmentId),
    };
  }

  async forgotPassword(req: Request, createForgotPasswordDto: CreateForgotPasswordDto, isForLogin = false) {
    const getUserDto = new GetUserDto();
    getUserDto.email = createForgotPasswordDto.email;
    const user = await this.findUsers(getUserDto);
    getUserDto.email = createForgotPasswordDto.email;

    if (!user || !user.length) {
      return {
        email: createForgotPasswordDto.email,
        success: 1,
      };
    }

    const pin = Math.floor(1000 + Math.random() * 9000);
    const forgotPassword = await this.forgotPasswordModel.create({
      email: createForgotPasswordDto.email,
      verification: pin,
      expires: addHours(new Date(), this.HOURS_TO_VERIFY),
      isForLogin: isForLogin,
      ip: this.authService.getIp(req),
      browser: this.authService.getBrowserInfo(req),
      country: this.authService.getCountry(req),
    });
    try {
      await forgotPassword.save();
    } catch (error) {
      console.error("Error saving forgotPassword:", error);
    }

    // const emailBody = this.emailService.loadTemplate(isForLogin ? "login-otp" : "forgot-password", { pin });
    // await this.emailService.sendUsingSendGrid(createForgotPasswordDto.email, isForLogin ? "Login OTP" : "Reset Password", emailBody);

    return {
      email: createForgotPasswordDto.email,
      success: 1,

    };
  }

  async forgotPasswordVerify(req: Request, verifyUuidDto: VerifyUuidDto) {
    try {
      const forgotPassword = await this.forgotPasswordModel.findOne({
        verification: verifyUuidDto.verification,
        email: verifyUuidDto.email,
        firstUsed: false,
        finalUsed: false,
        // expires: { $gt: new Date() },
      });
      if (!forgotPassword) {
        throw new BadRequestException('Invalid or expired OTP');
      }
      forgotPassword.firstUsed = true;
      forgotPassword.ipChanged = this.authService.getIp(req);
      forgotPassword.browserChanged = this.authService.getBrowserInfo(req);
      forgotPassword.countryChanged = this.authService.getCountry(req);
      await forgotPassword.save();

      return {
        email: forgotPassword.email,
        success: 1,
      };
    } catch (error) {
      // Log any unexpected errors for debugging
      console.error('Error in forgotPasswordVerify:', error);
      throw new BadRequestException('Invalid or expired OTP');
    }
  }


  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const forgotPassword = await this.forgotPasswordModel.findOne({
      email: resetPasswordDto.email,
      firstUsed: true,
      finalUsed: false,
      expires: { $gt: new Date() },
    });
    if (!forgotPassword) {
      throw new BadRequestException("Invalid or expired otp");
    }

    forgotPassword.finalUsed = true;
    await forgotPassword.save();

    await this.resetUserPassword(resetPasswordDto);
    return {
      email: resetPasswordDto.email,
      success: 1,
    };
  }

  async changePassword(email: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new NotFoundException("Invalid password.");
    }

    if (!user.verified) {
      throw new BadRequestException("Please verify you account", "verify-account");
    }

    if (user.isBlocked) {
      throw new BadRequestException("Please reset password using link on the login", "account-blocked");
    }

    const isPasswordMatched = await this.isPasswordMatched(changePasswordDto.password, user.password);
    if (!isPasswordMatched) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= this.LOGIN_ATTEMPTS_TO_BLOCK) {
        user.isBlocked = true;
      }

      await user.save();
      throw new NotFoundException("Invalid password.");
    }

    user.loginAttempts = 0;
    user.password = changePasswordDto.newPassword;
    await user.save();

    return {
      email: email,
      success: 1,
    };
  }

  async findUser(getUserDto: GetUserDto) {
    const where = {};
    if (getUserDto) {
      where["cnic"] = getUserDto;
    }
    return this.userModel.aggregate([{ "$match": where }]);
  }

  async findUsers(getUserDto: GetUserDto) {
    const where = {};
    const roleWhere = {
      $expr: { $eq: ["$_id", "$$roleId"] }
    };

    if (getUserDto.s) {
      if (!where["$or"]) where["$or"] = [];

      where["$or"].push(
        { fName: new RegExp(getUserDto.s, "i") },
        { lName: new RegExp(getUserDto.s, "i") },
        { email: new RegExp(getUserDto.s, "i") },
        { phone: new RegExp(getUserDto.s, "i") }
      )
    }

    if (getUserDto.email) {
      where["email"] = getUserDto.email;
    }

    if (getUserDto.roleId) {
      where["RoleId"] = new mongoose.Types.ObjectId(getUserDto.roleId);
    }

    if (getUserDto.role) {
      roleWhere["identifier"] = getUserDto.role;
    }

    if (getUserDto.phone) {
      where["phone"] = getUserDto.phone;
    }

    // if (getUserDto.cnic) {
    //   where["cnic"] = getUserDto.cnic;
    // }

    if (getUserDto.verified) {
      where['verified'] = getUserDto.verified === '1' ? true : false;
    }

    if (getUserDto.blocked) {
      where['isBlocked'] = getUserDto.blocked === '1' ? true : false;
    }

    if (getUserDto.departmentId) {
      where['departmentId'] = new mongoose.Types.ObjectId(getUserDto.departmentId);
    }

    return this.userModel.aggregate([
      { "$match": where },
      {
        $lookup:
        {
          from: 'roles',
          as: 'role',
          let: { roleId: '$RoleId' },
          pipeline: [
            {
              $match: roleWhere,
            }
          ]
        }
      },
      { $unwind: "$role" },

      {
        $project: { verification: 0, password: 0, verificationExpires: 0, config: 0 }
      },
      { $skip: Number(getUserDto.o) },
      { $limit: Number(getUserDto.l) },
    ]);
  }

  async findUsersCount(getUserDto: GetUserDto) {
    try {
      const where = {};
      const roleWhere = {
        $expr: { $eq: ["$_id", "$$roleId"] }
      };

      if (getUserDto.s) {
        if (!where["$or"]) where["$or"] = [];

        where["$or"].push(
          { fName: new RegExp(getUserDto.s, "i") },
          { lName: new RegExp(getUserDto.s, "i") },
          { email: new RegExp(getUserDto.s, "i") },
          { phone: new RegExp(getUserDto.s, "i") }
        )
      }

      if (getUserDto.email) {
        where["email"] = getUserDto.email;
      }

      if (getUserDto.roleId) {
        where["RoleId"] = new mongoose.Types.ObjectId(getUserDto.roleId);
      }

      if (getUserDto.role) {
        roleWhere["identifier"] = getUserDto.role;
      }

      if (getUserDto.phone) {
        where["phone"] = getUserDto.phone;
      }

      if (getUserDto.verified) {
        where['verified'] = getUserDto.verified === '1' ? true : false;
      }

      if (getUserDto.blocked) {
        where['isBlocked'] = getUserDto.blocked === '1' ? true : false;
      }

      const countResult = await this.userModel.aggregate([
        { "$match": where },
        {
          $lookup:
          {
            from: 'roles',
            as: 'role',
            let: { roleId: '$RoleId' },
            pipeline: [
              {
                $match: roleWhere,
              }
            ]
          }
        },
        { $unwind: "$role" },
        { $count: "count" }
      ])

      if (!countResult.length) return { count: 0 };

      return countResult[0];
    } catch (error) {
      return { count: 0 };
    }

    // return this.userModel.find(where)
    //   .select(['-verification', '-password', '-verificationExpires'])
    //   .populate({
    //     path: 'RoleId',
    //     match: { identifier: "admins" },
    //   })
    //   .sort([[getUserDto.sb, getUserDto.sd]])
    //   .skip(Number(getUserDto.o))
    //   .limit(Number(getUserDto.l))
    //   .exec();
  }

  async findOneUser(id: string): Promise<any> {
    return this.userModel.findById(id)
      // .select(['-verification', '-password', '-verificationExpires', '-config.vimeoKey', '-config.s3Bucket', '-config.s3AccessKeyId', '-config.s3SecretAccessKey', '-config.s3Region'])
      .populate("RoleId")
      .populate("departmentId")
      .exec();
  }

  async getUserConfig(id: string): Promise<any> {

    const user = await (await this.userModel.findById(id)).populate('departmentId');
    const company: any = user?.departmentId
    const userConfig = company.config || {};
    const config = {};
    Object.keys(userConfig).forEach((key) => {
      config[key] = ['vimeoKey', 's3Bucket', 's3AccessKeyId', 's3SecretAccessKey', 's3Region'].includes(key) ? this.decryptString(userConfig[key]) : userConfig[key];
    });
    return config;
  }


  async removeUser(id: string): Promise<User> {
    try {
      const removedUser = await this.userModel.findByIdAndRemove(id).exec();
      if (!removedUser) {
        throw new NotFoundException('User not found');
      }
      return removedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Re-throw the NotFoundException if it's already a NotFoundException
        throw error;
      }
      // Handle other potential errors (e.g., database errors)
      throw new NotFoundException('Error removing user');
    }
  }


  async create(createUserServiceDto: CreateUserServiceDto): Promise<any> {
    createUserServiceDto[`verified`] = true;
    const user = new this.userModel(createUserServiceDto);
    await this.isEmailUnique(user.email);
    const savedUser = await user.save();

    return savedUser;
  }

  async update(id: string, updateUserServiceDto: UpdateUserServiceDto) {
    try {
      if (updateUserServiceDto.password) {
        const hashed = await bcrypt.hash(updateUserServiceDto.password, 10);
        updateUserServiceDto.password = hashed;
      }
      this.userModel.updateOne({ _id: id }, updateUserServiceDto).exec();
      return true;
    } catch (error) {
      throw new BadRequestException("User could not be updated");
    }
  }

  async updateUserInfo(UserId: string, key: string, value: any) {
    const user = await this.userModel.findById(UserId);
    if (!user) return false;

    let info = user.config;
    if (!info) info = {};
    info[key] = value;

    await this.userModel.updateOne({ _id: UserId }, { info }).exec();
    return true;
  }

  // ********************************************
  // ╔═╗╦═╗╦╦  ╦╔═╗╔╦╗╔═╗  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  // ╠═╝╠╦╝║╚╗╔╝╠═╣ ║ ║╣   ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  // ╩  ╩╚═╩ ╚╝ ╩ ╩ ╩ ╚═╝  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  // ********************************************

  private async isEmailUnique(email: string) {
    const user = await this.userModel.findOne({ email });
    if (user) {
      throw new ConflictException("Email already exist");
    }
  }

  private setVerificationInfo(user): any {
    user.verification = Math.floor(1000 + Math.random() * 9000);
    user.verificationExpires = addHours(new Date(), this.HOURS_TO_VERIFY);
  }

  private async isPasswordMatched(attemptPass: string, password: string) {
    return await bcrypt.compare(attemptPass, password);
  }

  private async resetUserPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userModel.findOne({
      email: resetPasswordDto.email
    });
    if (!user) {
      return true;
    }
    user.verified = true;
    user.password = resetPasswordDto.password;
    await user.save();
  }

  private encryptString(inputString) {
    return CryptoJS.AES.encrypt(inputString, this.configService.get("encryptDataSecret")).toString();
  }

  private decryptString(inputString) {
    return CryptoJS.AES.decrypt(inputString, this.configService.get("encryptDataSecret")).toString(CryptoJS.enc.Utf8);
  }
}
