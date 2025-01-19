import { Document, Types } from "mongoose";

export interface IBase extends Document {
    name: string;
    slug: string;
    photo?: { data: Buffer; contentType: string };
}

export interface ICategory extends IBase {}
export interface ITag extends IBase {}

export interface CategoryRequest {
    name: string;
}

export interface TagRequest {
    name: string;
}

export interface IBlog extends Document {
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
    createdAt?: Date;
    updatedAt?: Date;
}
