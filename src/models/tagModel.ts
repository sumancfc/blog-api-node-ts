const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, max: 32, min: 3 },
    slug: { type: String, index: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tag", tagSchema);
