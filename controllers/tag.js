const Tag = require("../models/tagModel");
const Blog = require("../models/blogModel");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const { errorHandler } = require("../middlewares/dbErrorHandler");

//create tag
exports.createTag = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const slug = slugify(name).toLowerCase();

  const tagExists = await Tag.findOne({ name });

  if (tagExists) res.status(400).json({ message: "Tag already exist" });

  const tag = await new Tag({ name, slug }).save();

  if (tag) res.status(200).json(tag);
  else res.status(400).json({ message: "Failed to create tag" });
});

//get all tags
exports.getAllTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find({}).sort({ createdAt: -1 }).exec();

  res.status(200).json(tags);
});

//get single tags
exports.getSingleTag = asyncHandler(async (req, res) => {
  const slug = req.params.slug.toLowerCase();

  const tag = await Tag.findOne({ slug }).exec();

  if (!tag)
    res
      .status(400)
      .json({ message: "Tag not found or already have been deleted!" });

  // res.status(200).json(tag);
  const data = await Blog.find({ tags: tag })
    .populate("tags", "_id name slug")
    .populate("categories", "_id name slug")
    .populate("postedBy", "_id name")
    .select(
      "_id title slug excerpt categories tags postedBy createdAt updatedAt"
    )
    .exec();

  if (!data) res.status(400).json({ message: "Data not found" });

  res.status(200).json({ tag, blogs: data });
});

//update tag
exports.updateTag = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const slug = req.params.slug.toLowerCase();

  const tag = await Tag.findOneAndUpdate(
    { slug },
    { name, slug: slugify(name).toLowerCase() },
    { new: true }
  );

  res.json(tag);
});

//delete tag
exports.deleteTag = asyncHandler(async (req, res) => {
  const slug = req.params.slug.toLowerCase();

  const tag = await Tag.findOneAndDelete({ slug });

  if (!tag)
    res
      .status(400)
      .json({ message: "Tag not found or already have been deleted!" });

  res.status(200).json({ message: "Tag deleted successful" });
});
