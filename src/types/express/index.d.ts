import mongoose from "mongoose";
import { IUser } from "../../models/userModel";

declare global {
  namespace Express {
    interface Request {
      user?: { _id: mongoose.Types.ObjectId };
      profile?: IUser;
    }
  }
}
