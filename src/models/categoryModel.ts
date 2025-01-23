import mongoose, { Model, Schema } from "mongoose";
import { ICategory } from "../interfaces";

const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 120,
            minlength: 3,
        },
        slug: {
            type: String,
            index: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: (v: string): boolean =>
                    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v),
                message:
                    "Slug must contain only lowercase letters, numbers, and hyphens",
            },
        },
        photo: { data: Buffer, contentType: String },
    },
    { timestamps: true }
);

export const Category: Model<ICategory> = mongoose.model<ICategory>(
    "Category",
    categorySchema
);
