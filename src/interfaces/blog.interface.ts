import mongoose, { Document } from "mongoose";

export interface IBlog extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    photo?: {
        data: Buffer;
        contentType: string;
    };
    categories: mongoose.Types.ObjectId[];
    tags: mongoose.Types.ObjectId[];
    postedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    isPublished: boolean;
    comments: mongoose.Types.ObjectId[];
    totalComments: number;
}

export interface BlogRequest {
    title: string | string[];
    content: string | string[];
    categories: string[];
    tags: string[];
    isPublished?: string | string[];
}

export interface UpdateBlogRequest {
    title?: string | string[];
    content?: string | string[];
    categories?: string[] | mongoose.Types.ObjectId[];
    tags?: string[] | mongoose.Types.ObjectId[];
    isPublished?: string | string[];
}
