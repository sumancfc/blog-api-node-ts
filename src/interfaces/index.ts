import { Document, Types } from "mongoose";

// User
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

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface IBase extends Document {
  name: string;
  slug: string;
  photo?: { data: Buffer; contentType: string };
}

export interface ICategory extends IBase {}
export interface ITag extends IBase {}

export interface CategoryRequest {
  name: string;
}

export interface TagRequest {
  name: string;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  body: string | object;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  photo?: {
    data: Buffer;
    contentType: string;
  };
  categories: Types.ObjectId[];
  tags: Types.ObjectId[];
  postedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
