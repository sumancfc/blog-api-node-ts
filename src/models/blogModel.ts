import mongoose, { Document, Schema, Model, Types } from "mongoose";

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

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      minlength: 10,
      maxlength: 360,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    body: {
      type: Schema.Types.Mixed,
      required: true,
      minlength: 30,
      maxlength: 3000000,
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
