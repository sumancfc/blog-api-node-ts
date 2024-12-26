import mongoose, { Schema, Document } from "mongoose";

interface ICategory extends Document {
    name: string;
    slug: string;
    category_photo?: { data: Buffer; contentType: string; };
}
const categorySchema: Schema<ICategory> = new Schema({
    name: { type: String, trim: true, required: true, max: 30, min: 3 },
    slug: { type: String, unique: true, index: true },
      category_photo: { type: Buffer, contentType: String }
  }, { timestamps: true }
);

export default mongoose.model<ICategory>("Category", categorySchema);
