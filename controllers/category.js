const Category = require("../models/categoryModel");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");

//create category
exports.createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const categoryExists = await Category.findOne({ name });

  if (categoryExists)
    res.status(400).json({ message: "Category already exist." });

  const slug = slugify(name).toLowerCase();

  const category = await new Category({ name, slug }).save();

  if (category) res.status(200).json(category);
  else res.status(400).json({ message: "Failed to create category!" });
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
      .json({ message: "Category not found or already have been deleted!" });

  res.status(200).json(category);
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
      .json({ message: "Category not found or already have been deleted!" });

  res.status(200).json({ message: "Category deleted successfully" });
});
