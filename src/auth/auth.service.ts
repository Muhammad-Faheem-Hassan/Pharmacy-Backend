import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sign } from 'jsonwebtoken';
import { User } from 'src/user/interfaces/user.interface';
import { RefreshToken } from './interfaces/refresh-token.interface';
import { v4 } from 'uuid';
import { Request } from 'express';
import { getClientIp } from 'request-ip';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('RefreshToken') private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
   
  ) {
    
  }

  async createAccessToken(id: string, departmentId: string) {
    const accessToken = this.jwtService.sign({ id, departmentId }, { expiresIn: this.configService.get('jwtExpiration') });
    // return sign({userId}, JwtConstants process.env.JWT_SECRET || "hello" , { expiresIn: process.env.JWT_EXPIRATION || 3600 });
    return this.encryptText(accessToken);
  }

  async createRefreshToken(req: Request, userId,  departmentId: string) {
    const refreshToken = new this.refreshTokenModel({
      userId,
      departmentId,
      refreshToken: v4(),
      ip: this.getIp(req),
      browser: this.getBrowserInfo(req),
      country: this.getCountry(req),
    });
    await refreshToken.save();
    return refreshToken.refreshToken;
  }

  async findRefreshToken(token: string) {
    const refreshToken = await this.refreshTokenModel.findOne({ refreshToken: token });
    if (!refreshToken) {
      throw new UnauthorizedException('User has been logged out.');
    }
    return refreshToken.userId;
  }

  async validateUser(jwtPayload: IJwtPayload): Promise<any> {
    return await this.userModel.findOne({ _id: jwtPayload.id });
    // if (!user) {
    //   throw new UnauthorizedException('User not found');
    // }
    // return user;
  }

  private jwtExtractor(request) {
    let token = null;
    if (request.header('x-token')) {
      token = request.get('x-token');
    } else if (request.headers.authorization) {
      token = request.headers.authorization.replace('Bearer ', '').replace(' ', '');
    } else if (request.body.token) {
      token = request.body.token.replace(' ', '');
    }
    if (request.query.token) {
      token = request.body.token.replace(' ', '');
    }

    if (!token) {
      return undefined;
    }
    try {
      return CryptoJS.AES.decrypt(token, this.configService.get("encryptDataSecret")).toString(CryptoJS.enc.Utf8);
    } catch (err) {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  returnJwtExtractor() {
    return this.jwtExtractor;
  }

  getIp(req: Request): string {
    return getClientIp(req);
  }

  getBrowserInfo(req: Request): string {
    return req.header['user-agent'] || 'XX';
  }

  getCountry(req: Request): string {
    return req.header['cf-ipcountry'] ? req.header['cf-ipcountry'] : 'XX';
  }
  private encryptText(inputString) {
    return CryptoJS.AES.encrypt(inputString, this.configService.get("encryptDataSecret")).toString();
  }
}
