import mongoose, {Schema, Document} from "mongoose";
import crypto from "crypto";

interface IUser extends Document {
    username: string;
    name: string;
    email: string;
    hashed_password: string;
    profile: string;
    salt: string;
    about?: string;
    role: number;
    photo?: {
        data: Buffer;
        contentType: String;
    };
    resetPasswordLink?: string;
    password?: string;
    authenticate: (plaintext: string) => boolean;
    encryptPassword: (password: string) => string;
    makeSalt: () => string;
}

const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      max: 30,
      index: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      max: 30,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    profile: {
      type: String,
      required: true,
    },
    salt: String,
    about: {
      type: String,
    },
    role: {
      type: Number,
      default: 0,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    resetPasswordLink: {
      data: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema
  .virtual("password")
  .set(function (this: IUser, password: string) {
    //create a temporary variable called password
    this.password = password;
    //generate salt
    this.salt = this.makeSalt();
    //encrypt password
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function (this: IUser) {
    return this.password;
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
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    },

};

export default  mongoose.model<IUser>("User", userSchema);
