const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      min: 10,
      max: 360,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: {},
      required: true,
      min: 100,
      max: 3000000,
    },
    excerpt: {
      type: String,
      max: 120,
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
    categories: [{ type: ObjectId, ref: "Category", required: true }],
    tags: [{ type: ObjectId, ref: "Tag", required: true }],
    postedBy: { type: ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
