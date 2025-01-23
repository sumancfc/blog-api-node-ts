import mongoose, { Document } from "mongoose";

export interface IBase extends Document {
    _id: mongoose.Types.ObjectId;
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
