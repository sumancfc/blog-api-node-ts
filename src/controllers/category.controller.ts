import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Category } from "../models/category.model";
import { validateName, sendErrorResponse, createSlug } from "../utils";
import { CATEGORY_MESSAGES, HTTP_STATUS } from "../utils/statusMessage.util";
import { CategoryRequest, ICategory } from "../interfaces";

// Create category
export const createCategory: RequestHandler = asyncHandler(async (req, res) => {
    const { name } = req.body as CategoryRequest;

    if (!validateName(name)) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            "Category name is required"
        );
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            CATEGORY_MESSAGES.CATEGORY_EXISTS
        );
    }

    const category: ICategory = await new Category({ name }).save();

    category
        ? res.status(HTTP_STATUS.OK).json(category)
        : sendErrorResponse(
              res,
              HTTP_STATUS.BAD_REQUEST,
              CATEGORY_MESSAGES.CATEGORY_CREATE_FAILED
          );
});

// Get all categories
export const getAllCategories: RequestHandler = asyncHandler(async (_, res) => {
    const categories: ICategory[] = await Category.find({})
        .sort({ createdAt: -1 })
        .exec();
    res.status(HTTP_STATUS.OK).json(categories);
});

// Get single category
export const getSingleCategory: RequestHandler = asyncHandler(
    async (req, res) => {
        const slug: string = createSlug(req.params.slug);
        const category: ICategory | null = await Category.findOne({
            slug,
        }).exec();

        category
            ? res.status(HTTP_STATUS.OK).json(category)
            : sendErrorResponse(
                  res,
                  HTTP_STATUS.NOT_FOUND,
                  CATEGORY_MESSAGES.CATEGORY_NOT_FOUND
              );
    }
);

// Update category
export const updateCategory: RequestHandler = asyncHandler(async (req, res) => {
    const { name } = req.body as CategoryRequest;
    const categoryId: string = req.params.id;

    if (!validateName(name)) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            "Category name is required"
        );
    }

    const updatedSlug: string = createSlug(name);

    const existingCategory = await Category.findOne({
        name,
        _id: { $ne: categoryId },
    });

    if (existingCategory) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            CATEGORY_MESSAGES.CATEGORY_EXISTS
        );
    }

    const updatedCategory: ICategory | null = await Category.findByIdAndUpdate(
        categoryId,
        { name, slug: updatedSlug },
        { new: true }
    );

    updatedCategory
        ? res.status(HTTP_STATUS.OK).json(updatedCategory)
        : sendErrorResponse(
              res,
              HTTP_STATUS.NOT_FOUND,
              CATEGORY_MESSAGES.CATEGORY_NOT_FOUND
          );
});

// Delete category
export const deleteCategory: RequestHandler = asyncHandler(async (req, res) => {
    const categoryId: string = req.params.id;

    const deletedCategory: ICategory | null =
        await Category.findByIdAndDelete(categoryId);

    deletedCategory
        ? res
              .status(HTTP_STATUS.OK)
              .json({ message: CATEGORY_MESSAGES.CATEGORY_DELETED })
        : sendErrorResponse(
              res,
              HTTP_STATUS.NOT_FOUND,
              CATEGORY_MESSAGES.CATEGORY_NOT_FOUND
          );
});
