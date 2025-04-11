import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import AWS from "aws-sdk";
import { ObjectId } from "mongoose";
import { UserService } from "src/user/user.service";

@Injectable()
export class AwsService {
  private s3: AWS.S3;
  private bucket: string;

  constructor(private readonly configService: ConfigService, private readonly userService: UserService) {
    // this.s3 = new AWS.S3({
    //   accessKeyId: configService.get("accessKeyId"),
    //   secretAccessKey: configService.get("secretAccessKey"),
    //   region: configService.get("region"),
    // });
    // this.bucket = this.configService.get("bucket");
  }

  private async loadUserS3(userId: string) {
    const user = await this.userService.findOneUser(userId);
    const config = await this.userService.getUserConfig(userId);
    
    if (config && config.s3Bucket && config.s3AccessKeyId && config.s3SecretAccessKey && config.s3Region) {
      this.s3 = new AWS.S3({
        accessKeyId: config.s3AccessKeyId,
        secretAccessKey: config.s3SecretAccessKey,
        region: config.s3Region,
      });
      this.bucket = config.s3Bucket;
      console.log(`Used User Specific S3 Credentials - ${user.email}`);
    } else {
      this.s3 = new AWS.S3({
        accessKeyId: this.configService.get("accessKeyId"),
        secretAccessKey: this.configService.get("secretAccessKey"),
        region: this.configService.get("region"),
      });
      this.bucket = this.configService.get("bucket");
      console.log(`Used Default S3 Credentials - ${user?.email || userId}`);
    }
  }

  async uploadFile(userId: string, file: Buffer, name: string, config = {}) {
    await this.loadUserS3(userId);
    // Setting up S3 upload parameters
    const params = {
      Bucket: this.bucket,
      Key: name,
      Body: file,
    };

    // Uploading files to the bucket
    return this.s3.upload({ ...params, ...config }).promise();
  }

  /**
   * 
   * @param key The path of the file to be uploaded.
   * @param contentType A standard MIME type describing the format of the object data.
   * @param acl The permission to object which can be private | public-read | public-read-write | authenticated-read
   * @param expires The expiry time of the file url in seconds (Default is 10 minutes).
   * @param params Other parameters to pass to S3 getSignedUrl.
   * @returns File url
   */
  async getPreSignedUrl(userId: string, key: string, contentType: string, acl = 'public-read', expires = 60 * 10, params = {}): Promise<string> {
    await this.loadUserS3(userId);
    const s3Params = {
      Bucket: this.bucket,
      Expires: expires,
      ACL: acl,
      Key: key,
      ContentType: contentType,
    };

    return this.s3.getSignedUrl('putObject', { ...s3Params, ...params });
  }

  /**
   * Use it to get a signed url for file access.
   * @param key The path of the existing file to get a pre signed url.
   * @param expires The expiry time of the file url in seconds (Default is 10 minutes).
   * @returns File url
   */
  async getPresignedUrl(userId: string, key: string, expires = 60 * 10): Promise<string> {
    await this.loadUserS3(userId);
    const s3Params = {
      Bucket: this.bucket,
      Expires: expires,
      Key: key
    };

    return this.s3.getSignedUrl('getObject', s3Params);
  }

  /**
   * Delete an object from the S3 bucket.
   * @param key The path of object to delete.
   * @returns 
   */
  async deleteObject(userId: string, key: string) {
    await this.loadUserS3(userId);
    const s3Params = {
      Bucket: this.bucket,
      Key: key
    };

    return this.s3.deleteObject(s3Params);
  }

  /**
   * Delete objects from the S3 bucket.
   * @param keys Array of string keys to delete
   * @returns 
   */
  async deleteObjects(userId: string, keys: string[]) {
    await this.loadUserS3(userId);
    const objects = keys.map(key => {
      return {
        Key: key
      }
    })

    const s3Params = {
      Bucket: this.bucket,
      Delete: {
        Objects: objects,
        Quiet: false
      }
    };
    try {
      await this.s3.deleteObjects(s3Params).promise();
      console.log('Objects deleted successfully');
    } catch (err) {
      console.error('Error deleting objects:', err);
    }
    // return this.s3.deleteObjects(s3Params);
  }
}
