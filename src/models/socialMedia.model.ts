import mongoose, { Schema, Document, Model } from "mongoose";
import { ISocialMedia } from "../interfaces";

const SocialMediaSchema = new Schema<ISocialMedia>({
    name: { type: String, required: true },
    link: { type: String, required: true },
    icon: { type: String, required: true },
});

export const SocialMedia: Model<ISocialMedia> = mongoose.model<ISocialMedia>(
    "SocialMedia",
    SocialMediaSchema
);
