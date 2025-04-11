import { Schema } from "mongoose";
import validator from "validator";

export const ForgotPasswordSchema = new Schema(
  {
    email: {
      required: [true, "EMAIL_IS_BLANK"],
      type: String,
    },
    verification: {
      type: String,
      required: true,
    },
    firstUsed: {
      type: Boolean,
      default: false,
    },
    finalUsed: {
      type: Boolean,
      default: false,
    },
    expires: {
      type: Date,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    browser: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    ipChanged: {
      type: String,
    },
    browserChanged: {
      type: String,
    },
    countryChanged: {
      type: String,
    },
    isForLogin: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
