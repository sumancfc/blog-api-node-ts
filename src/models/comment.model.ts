import mongoose, { Schema, Model } from "mongoose";
import { IComment } from "../interfaces/comment.interface";

const commentSchema: Schema = new Schema(
    {
        content: { type: String, required: true },
        commentedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
        parentComment: { type: Schema.Types.ObjectId, ref: "Comment" },
    },
    { timestamps: true }
);

export const Comment: Model<IComment> = mongoose.model<IComment>(
    "Comment",
    commentSchema
);
