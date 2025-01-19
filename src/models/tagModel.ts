import mongoose, { Schema } from "mongoose";
import { ITag } from "../interfaces";

const tagSchema = new Schema<ITag>(
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
                validator: (v: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v),
                message:
                    "Slug must contain only lowercase letters, numbers, and hyphens",
            },
        },
        photo: { type: Buffer, contentType: String },
    },
    { timestamps: true }
);

export const Tag = mongoose.model<ITag>("Tag", tagSchema);
