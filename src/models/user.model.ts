import mongoose, { Model, Schema } from "mongoose";
import crypto from "crypto";
import {
    UserRole,
    AccountStatus,
    Gender,
    IUser,
} from "../interfaces/user.interface";

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
        designation: { type: String },
        phone: { type: Number },
        website: { type: String },
        address: { type: String },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.USER,
        },
        photo: { data: Buffer, contentType: String },
        dateOfBirth: { type: Date },
        gender: {
            type: String,
            enum: Object.values(Gender),
        },
        languages: [{ type: String }],
        socialMedia: [
            {
                socialMediaId: {
                    type: Schema.Types.ObjectId,
                    ref: "SocialMedia",
                    required: true,
                },
                username: { type: String, required: true },
            },
        ],
        following: [ { type: Schema.Types.ObjectId } ],
        followers: [ { type: Schema.Types.ObjectId } ],
        friends: [ { type: Schema.Types.ObjectId } ],
        accountStatus: {
            type: String,
            enum: Object.values(AccountStatus),
            default: AccountStatus.INACTIVE,
        },
        lastLogin: { type: Date },
        preferences: {
            theme: { type: String, default: "light" },
            notifications: { type: Boolean, default: true },
        },
        profession: { type: String },
        company: { type: String },
        emergencyContact: {
            name: { type: String },
            relationship: { type: String },
            phone: { type: String },
        },
        twoFactorEnabled: { type: Boolean, default: false },
        is_verified: {
            type: Boolean,
            default: false,
        },
        resetPassword: {
            type: String,
            default: "",
        },
        resetPasswordExpires: {
            type: Date,
        },
        agreedToTerms: {
            type: Boolean,
            required: true,
            validate: {
                validator: function (value: boolean): boolean {
                    return value === true;
                },
                message: "You must agree to the terms and conditions.",
            },
        },
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

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
