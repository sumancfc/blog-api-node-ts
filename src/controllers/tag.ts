import { Request, Response } from "express";
import slugify from "slugify";
import asyncHandler from "express-async-handler";
// const Blog = require("../models/blogModel");
import Tag, { ITag } from "../models/tagModel";
import { TagRequest, HTTP_STATUS, TAG_MESSAGES, handleError } from "../utils";

// Create Tag
export const createTag = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body as TagRequest;

      if (!name || name.trim() === "") {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: "Tag name is required" });
        return;
      }

      const tagExists = await Tag.findOne({ name });
      if (tagExists) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: TAG_MESSAGES.TAG_EXISTS });
        return;
      }

      const slug = slugify(name).toLowerCase();
      const tag: ITag = await new Tag({ name, slug }).save();

      if (tag) {
        res.status(HTTP_STATUS.OK).json(tag);
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: TAG_MESSAGES.TAG_CREATE_FAILED });
      }
    } catch (error) {
      handleError(res, error);
    }
  }
);

// Get all tags
export const getAllTags = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const tags: ITag[] = await Tag.find({}).sort({ createdAt: -1 }).exec();

      res.status(HTTP_STATUS.OK).json(tags);
    } catch (error) {
      handleError(res, error);
    }
  }
);

// Get single tags
export const getSingleTag = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const slug = req.params.slug.toLowerCase();
      const tag: ITag | null = await Tag.findOne({ slug }).exec();

      if (!tag) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ error: TAG_MESSAGES.TAG_NOT_FOUND });
        return;
      }

      res.status(HTTP_STATUS.OK).json(tag);

      // const data = await Blog.find({ tags: tag })
      //   .populate("tags", "_id name slug")
      //   .populate("categories", "_id name slug")
      //   .populate("postedBy", "_id name")
      //   .select(
      //     "_id title slug excerpt categories tags postedBy createdAt updatedAt"
      //   )
      //   .exec();

      // if (!data) res.status(400).json({ error: "Data not found" });

      // res.status(200).json({ tag, blogs: data });
    } catch (error) {
      handleError(res, error);
    }
  }
);

// Update tag
export const updateTag = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body as TagRequest;
      const slug = req.params.slug.toLowerCase();

      if (!name || name.trim() === "") {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: "Tag name is required" });
        return;
      }

      const tag: ITag | null = await Tag.findOneAndUpdate(
        { slug },
        { name, slug: slugify(name).toLowerCase() },
        { new: true }
      );

      if (!tag) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ error: TAG_MESSAGES.TAG_NOT_FOUND });
        return;
      }

      res.status(HTTP_STATUS.OK).json(tag);
    } catch (error) {
      handleError(res, error);
    }
  }
);

// Delete tag
export const deleteTag = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const slug = req.params.slug.toLowerCase();
      const tag: ITag | null = await Tag.findOneAndRemove({ slug });

      if (!tag) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ error: TAG_MESSAGES.TAG_NOT_FOUND });
        return;
      }

      res.status(HTTP_STATUS.OK).json({ message: TAG_MESSAGES.TAG_DELETED });
    } catch (error) {
      handleError(res, error);
    }
  }
);
