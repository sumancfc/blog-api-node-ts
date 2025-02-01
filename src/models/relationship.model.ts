import mongoose, { Model } from "mongoose";

export interface IRelationship {
    _id?: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
    relatedUserId: mongoose.Schema.Types.ObjectId;
    relationshipType:{
        type: string,
        enum: ["friend", "follower", "following"],
        required: true,
    };
    createdAt: Date;
    updatedAt: Date;
}

const relationshipSchema = new mongoose.Schema<IRelationship>({
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
    },
    relatedUserId: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
    },
    relationshipType: {
        type: String,
        enum: ["friend", "follower", "following"],
        required: true,
    }
});

export const Relationship: Model<IRelationship> = mongoose.model<IRelationship>("Relationship", relationshipSchema);