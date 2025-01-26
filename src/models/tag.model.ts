import mongoose, { Model, Schema } from "mongoose";
import { ITag } from "../interfaces";
import slugify from "slugify";

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

tagSchema.pre("save", async function (next) {
    this.slug = slugify(this.name).toLowerCase();
    next();
});

export const Tag: Model<ITag> = mongoose.model<ITag>("Tag", tagSchema);
