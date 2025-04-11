import { Document } from "mongoose";

export interface User extends Document {
  fName: string;
  lName: string;
  email: string;
  password: string;
  RoleId:string;
  verification: string;
  verified: boolean;
  isBlocked: boolean;
  verificationExpires: Date;
  loginAttempts?: number;
  phone?: string;
  profilePicture?: string;
  termAndCondition?: boolean;
  config?: object;
  departmentId: string;
}
