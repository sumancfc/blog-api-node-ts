import mongoose, { Model, Schema } from "mongoose";
import { ICategory } from "../interfaces";
import { createSlug } from "../helpers";
import slugify from "slugify";

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

categorySchema.pre("save", async function (next) {
    this.slug = slugify(this.name).toLowerCase();
    next();
});

export const Category: Model<ICategory> = mongoose.model<ICategory>(
    "Category",
    categorySchema
);
