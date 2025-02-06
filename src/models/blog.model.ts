import mongoose, { Schema, Model } from "mongoose";
import { IBlog, IUserLike } from "../interfaces/blog.interface";

const userLikeSchema = new Schema<IUserLike>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
    like: { type: Boolean, required: true, default: true }, // Initially true for like
});

export const UserLike: Model<IUserLike> = mongoose.model<IUserLike>(
    "UserLike",
    userLikeSchema
);

const blogSchema = new Schema<IBlog>(
    {
        title: {
            type: String,
            trim: true,
            required: true,
            minlength: 10,
            maxlength: 2000,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 30000000,
        },
        excerpt: {
            type: String,
            maxlength: 120,
        },
        metaTitle: {
            type: String,
        },
        metaDescription: {
            type: String,
        },
        photo: {
            data: Buffer,
            contentType: String,
        },
        categories: [
            { type: Schema.Types.ObjectId, ref: "Category", required: true },
        ],
        tags: [{ type: Schema.Types.ObjectId, ref: "Tag", required: true }],
        postedBy: { type: Schema.Types.ObjectId, ref: "User" },
        isPublished: {
            type: Boolean,
            default: true,
        },
        comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
        totalComments: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export const Blog: Model<IBlog> = mongoose.model<IBlog>("Blog", blogSchema);
