import mongoose, { Schema, Model } from "mongoose";
import { IBlog } from "../interfaces/blog";

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
    },
    { timestamps: true }
);

export const Blog: Model<IBlog> = mongoose.model<IBlog>("Blog", blogSchema);
