import mongoose from "mongoose";
const bcrypt = require('bcryptjs');


export const UserSchema = new mongoose.Schema(
  {
    fName: {
      type: String,
      minlength: 2,
      maxlength: 100,
      required: true,
    },
    lName: {
      type: String,
      minlength: 2,
      maxlength: 100,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },

    email: {
      type: String,
      lowercase: true,
      maxlength: 255,
      minlength: 6,
      required: true,
    },

    cnic: {
      type: String,
      lowercase: true,
      maxlength: 255,
      minlength: 6,
      required: true,
    },

    password: {
      type: String,
      minlength: 5,
      maxlength: 1024,
      required: true,
    },

    phone: {
      type: String,
      maxlength: 32,
    },

    profilePicture: {
      type: String,
      minlength: 2,
      maxlength: 255,
    },

    termAndCondition: {
      type: Boolean,
      default: false,
    },
    
    RoleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    },

    verification: {
      type: String,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    verificationExpires: {
      type: Date,
      default: Date.now,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    expiry: {
      type: Date,
      default: null,
    },
  },

  {
    versionKey: false,
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }

    const hashed = await bcrypt.hash(this.password, 10);
    this.password = hashed;

    return next();
  } catch (err) {
    return next(err);
  }
}); 
