import { Request, Response } from "express";
import slugify from "slugify";
import asyncHandler from "express-async-handler";
import Category, { ICategory } from "../models/categoryModel";
import {
  CategoryRequest,
  HTTP_STATUS,
  CATEGORY_MESSAGES,
  handleError,
} from "../utils";

// Create category
export const createCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body as CategoryRequest;

      if (!name || name.trim() === "") {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: "Category name is required" });
        return;
      }

      const categoryExists = await Category.findOne({ name });
      if (categoryExists) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: CATEGORY_MESSAGES.CATEGORY_EXISTS });
        return;
      }

      const slug = slugify(name).toLowerCase();
      const category: ICategory = await new Category({ name, slug }).save();

      if (category) {
        res.status(HTTP_STATUS.OK).json(category);
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: CATEGORY_MESSAGES.CATEGORY_CREATE_FAILED });
      }
    } catch (error) {
      handleError(res, error);
    }
  }
);

// Get all categories
export const getAllCategories = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const categories: ICategory[] = await Category.find({})
        .sort({ createdAt: -1 })
        .exec();
      res.status(HTTP_STATUS.OK).json(categories);
    } catch (error) {
      handleError(res, error);
    }
  }
);

// Get single category
export const getSingleCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const slug = req.params.slug.toLowerCase();
      const category: ICategory | null = await Category.findOne({
        slug,
      }).exec();

      if (!category) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ error: CATEGORY_MESSAGES.CATEGORY_NOT_FOUND });
        return;
      }

      res.status(HTTP_STATUS.OK).json(category);

      // Find blogs associated with the category
      // const blogs = await Blog.find({ categories: category._id })
      //     .populate("categories", "_id name slug")
      //     .populate("tags", "_id name slug")
      //     .populate("postedBy", "_id name")
      //     .select(
      //         "_id title slug excerpt categories tags postedBy createdAt updatedAt"
      //     )
      //     .exec();
      //
      // if (!blogs || blogs.length === 0) {
      //   res.status(404).json({ error: "No blogs found for this category." });
      //   return;
      // }

      // res.status(200).json({ category, blogs });
    } catch (error) {
      handleError(res, error);
    }
  }
);

// Update category
export const updateCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body as CategoryRequest;
      const slug = req.params.slug.toLowerCase();

      if (!name || name.trim() === "") {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: "Category name is required" });
        return;
      }

      const category: ICategory | null = await Category.findOneAndUpdate(
        { slug },
        { name, slug: slugify(name).toLowerCase() },
        { new: true }
      );

      if (!category) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ error: CATEGORY_MESSAGES.CATEGORY_NOT_FOUND });
        return;
      }

      res.status(HTTP_STATUS.OK).json(category);
    } catch (error) {
      handleError(res, error);
    }
  }
);

// Delete category
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const slug = req.params.slug.toLowerCase();
      const category: ICategory | null = await Category.findOneAndDelete({
        slug,
      });

      if (!category) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ error: CATEGORY_MESSAGES.CATEGORY_NOT_FOUND });
        return;
      }

      res
        .status(HTTP_STATUS.OK)
        .json({ message: CATEGORY_MESSAGES.CATEGORY_DELETED });
    } catch (error) {
      handleError(res, error);
    }
  }
);
