import mongoose, { Schema, Document } from "mongoose";

export interface ITag extends Document {
  name: string;
  slug: string;
  tag_photo?: { data: Buffer; contentType: string };
}

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      minlength: 3,
    },
    slug: {
      type: String,
      index: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v),
        message:
          "Slug must contain only lowercase letters, numbers, and hyphens",
      },
    },
    tag_photo: { type: Buffer, contentType: String },
  },
  { timestamps: true }
);

export const Tag = mongoose.model<ITag>("Tag", tagSchema);
