const Category = require("../models/categoryModel");
const Blog = require("../models/blogModel");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");

//create category
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;

  const categoryExists = await Category.findOne({ name });

  if (categoryExists)
    res.status(400).json({ error: "Category already exist." });

  // const slug = slugify(name).toLowerCase();

  const category = await new Category({ name, slug }).save();

  if (category) res.status(200).json(category);
  else res.status(400).json({ error: "Failed to create category!" });
});

//get all categories
exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ createdAt: -1 }).exec();

  res.status(200).json(categories);
});

//get single category
exports.getSingleCategory = asyncHandler(async (req, res) => {
  const slug = req.params.slug.toLowerCase();

  const category = await Category.findOne({ slug }).exec();

  if (!category)
    res
      .status(400)
      .json({ error: "Category not found or already have been deleted!" });

  // res.status(200).json(category);
  const data = await Blog.find({ categories: category })
    .populate("categories", "_id name slug")
    .populate("tags", "_id name slug")
    .populate("postedBy", "_id name")
    .select(
      "_id title slug excerpt categories tags postedBy createdAt updatedAt"
    )
    .exec();

  if (!data) res.status(400).json({ error: "Data not found" });

  res.status(200).json({ category, blogs: data });
});

//update category
exports.updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const slug = req.params.slug.toLowerCase();

  const category = await Category.findOneAndUpdate(
    { slug },
    { name, slug: slugify(name).toLowerCase() },
    { new: true }
  );

  res.json(category);
});

//delete category
exports.deleteCategory = asyncHandler(async (req, res) => {
  const slug = req.params.slug.toLowerCase();

  const category = await Category.findOneAndRemove({ slug });

  if (!category)
    res
      .status(400)
      .json({ error: "Category not found or already have been deleted!" });

  res.status(200).json({ message: "Category deleted successfully" });
});
