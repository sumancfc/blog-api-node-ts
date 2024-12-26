import mongoose, { Schema, Document } from "mongoose";

export interface ITag extends Document {
  name: string;
  slug: string;
  tag_photo?: { data: Buffer; contentType: string };
}

const tagSchema: Schema<ITag> = new Schema(
  {
    name: { type: String, trim: true, required: true, max: 32, min: 3 },
    slug: { type: String, index: true, unique: true },
    tag_photo: { type: Buffer, contentType: String },
  },
  { timestamps: true }
);

const Tag = mongoose.model<ITag>("Tag", tagSchema);
export default Tag;
