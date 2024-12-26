import { Request, Response } from 'express';
// const Blog = require("../models/blogModel");
import Category from "../models/categoryModel";
import slugify from "slugify";
import asyncHandler from "express-async-handler";
import {errorHandler} from "../middlewares/dbErrorHandler";


// Create category
export const createCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    // Check if the category already exists
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      res.status(400).json({ error: "Category already exists." });
      return;
    }

    // Create slug and save the category
    const slug = slugify(name).toLowerCase();
    const category = await new Category({ name, slug }).save();

    if (category) {
      res.status(200).json(category);
    } else {
      res.status(400).json({ error: "Failed to create category!" });
    }
  } catch (error) {
    // Use the errorHandler to process the error
    const errorMessage = errorHandler(error as Error); // Cast error to `Error`
    res.status(500).json({ error: errorMessage });
  }
});

//get all categories
export const getAllCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const categories = await Category.find({}).sort({ createdAt: -1 }).exec();

  res.status(200).json(categories);
});

// //get single category
// exports.getSingleCategory = asyncHandler(async (req, res) => {
//   const slug = req.params.slug.toLowerCase();
//
//   const category = await Category.findOne({ slug }).exec();
//
//   if (!category)
//     res
//       .status(400)
//       .json({ error: "Category not found or already have been deleted!" });
//
//   // res.status(200).json(category);
//   const data = await Blog.find({ categories: category })
//     .populate("categories", "_id name slug")
//     .populate("tags", "_id name slug")
//     .populate("postedBy", "_id name")
//     .select(
//       "_id title slug excerpt categories tags postedBy createdAt updatedAt"
//     )
//     .exec();
//
//   if (!data) res.status(400).json({ error: "Data not found" });
//
//   res.status(200).json({ category, blogs: data });
// });
//
// //update category
// exports.updateCategory = asyncHandler(async (req, res) => {
//   const { name } = req.body;
//   const slug = req.params.slug.toLowerCase();
//
//   const category = await Category.findOneAndUpdate(
//     { slug },
//     { name, slug: slugify(name).toLowerCase() },
//     { new: true }
//   );
//
//   res.json(category);
// });
//
// //delete category
// exports.deleteCategory = asyncHandler(async (req, res) => {
//   const slug = req.params.slug.toLowerCase();
//
//   const category = await Category.findOneAndRemove({ slug });
//
//   if (!category)
//     res
//       .status(400)
//       .json({ error: "Category not found or already have been deleted!" });
//
//   res.status(200).json({ message: "Category deleted successfully" });
// });