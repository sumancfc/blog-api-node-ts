import { Schema, Model, model } from "mongoose";
import { IComment } from "./../interfaces/comment.interface";

export const commentSchema = new Schema<IComment>(
    {
        content: {
            type: String,
            required: true,
        },
        commentedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        replies: [
            {
                type: Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        blog: {
            type: Schema.Types.ObjectId,
            ref: "Blog",
            required: true,
        },
    },
    { timestamps: true }
);

export const Comment: Model<IComment> = model<IComment>(
    "Comment",
    commentSchema
);
