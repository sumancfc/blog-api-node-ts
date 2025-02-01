import mongoose, { Document } from "mongoose";
import { ISocialMedia } from "./index";
import { IRelationship } from "../models/relationship.model";

/*****
 User Interfaces
 ****/
export enum UserRole {
    ADMIN = "admin",
    EDITOR = "editor",
    CONTRIBUTOR = "contributor",
    AUTHOR = "author",
    USER = "user",
}

export enum AccountStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
}

export enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other",
    PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

export interface IEmergencyContact {
    name: string;
    relationship: string;
    phone: string;
}

export interface IPreferences {
    theme: string;
    notifications: boolean;
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    name: string;
    email: string;
    hashed_password: string;
    profile: string;
    salt: string;
    about?: string;
    designation?: string;
    phone?: number;
    website?: string;
    address?: string;
    role: UserRole;
    photo?: { data: Buffer; contentType: String };
    dateOfBirth?: Date;
    gender?: Gender;
    languages?: string[];
    socialMedia?: ISocialMedia;
    following: IRelationship[];
    followers: IRelationship[];
    friends: IRelationship[];
    accountStatus: AccountStatus;
    lastLogin?: Date;
    preferences: IPreferences;
    profession?: string;
    company?: string;
    emergencyContact?: IEmergencyContact;
    twoFactorEnabled: boolean;
    resetPasswordLink: string;
    is_verified: boolean;
    resetPassword: string;
    resetPasswordExpires: Date;
    agreedToTerms: boolean;
    _password?: string;
    authenticate: (plainText: string) => boolean;
    encryptPassword: (password: string) => string;
    makeSalt: () => string;
    [key: string]: any;
}

export interface UserRequest {
    email: string;
    password: string;
}

export interface SignUpRequest extends UserRequest {
    name: string;
    agreedToTerms: boolean;
}

export interface SignInRequest extends UserRequest {}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    resetCode: string;
    newPassword: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    gender: Gender;
    role: UserRole;
}
