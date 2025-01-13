import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export enum UserRole {
  ADMIN = "admin",
  EDITOR = "editor",
  CONTRIBUTOR = "contributor",
  AUTHOR = "author",
  USER = "user",
}

export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  hashed_password: string;
  profile: string;
  salt: string;
  about?: string;
  role: UserRole;
  photo?: { data: Buffer; contentType: String };
  resetPasswordLink: string;
  _password?: string;
  authenticate: (plainText: string) => boolean;
  encryptPassword: (password: string) => string;
  makeSalt: () => string;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxlength: 30,
      index: true,
      lowercase: true,
    },
    name: { type: String, required: true, maxlength: 30 },
    email: { type: String, trim: true, required: true, unique: true },
    hashed_password: { type: String, required: true, select: false },
    profile: { type: String, required: true },
    salt: { type: String, required: true, select: false },
    about: { type: String },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    photo: { data: Buffer, contentType: String },
    resetPasswordLink: { data: String },
  },
  { timestamps: true }
);

userSchema
  .virtual("password")
  .set(function (this: IUser, password: string) {
    //create a temporary variable called password
    this._password = password;
    //generate salt
    this.salt = this.makeSalt();
    //encrypt password
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function (this: IUser) {
    return this._password;
  });

userSchema.methods = {
  authenticate: function (this: IUser, plainText: string) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function (this: IUser, password: string) {
    if (!password) return "";

    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },

  makeSalt: function (): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  },
};

export const User = mongoose.model<IUser>("User", userSchema);
