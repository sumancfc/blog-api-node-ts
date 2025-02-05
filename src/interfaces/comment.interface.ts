import mongoose, { Schema, Types } from "mongoose";

export interface IComment extends Document {
    _id?: mongoose.Schema.Types.ObjectId;
    content: string;
    commentedBy: Schema.Types.ObjectId;
    blog: Schema.Types.ObjectId;
    parentComment?: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface CommentTreeItem extends Omit<IComment, "_id"> {
    _id: Types.ObjectId;
    replies: CommentTreeItem[];
}

export interface GetCommentsOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface PaginatedCommentResult {
    comments: CommentTreeItem[];
    totalRootComments: number;
}
