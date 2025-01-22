import { Document, Types } from "mongoose";

export interface IBlog extends Document {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    body: string | object;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    photo?: {
        data: Buffer;
        contentType: string;
    };
    categories: Types.ObjectId[];
    tags: Types.ObjectId[];
    postedBy?: Types.ObjectId;
}

export interface BlogRequest {
    title: string;
    body: string | object;
    categories: Types.ObjectId[];
    tags: Types.ObjectId[];
}
