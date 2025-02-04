import { Types } from "mongoose";

export interface IComment extends Document {
    _id?: Types.ObjectId;
    content: string;
    commentedBy: Types.ObjectId;
    replies: Types.ObjectId[];
    blog: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
