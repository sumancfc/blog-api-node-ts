import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Tag } from "../models/tagModel";
import { validateName, sendErrorResponse, createSlug } from "../helpers";
import { ITag, TagRequest } from "../interfaces";
import { HTTP_STATUS, TAG_MESSAGES } from "../utils/status_message";

// Create Tag
export const createTag: RequestHandler = asyncHandler(async (req, res) => {
    const { name } = req.body as TagRequest;

    if (!validateName(name)) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            "Tag name is required"
        );
    }

    const tagExists = await Tag.findOne({ name });
    if (tagExists) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            TAG_MESSAGES.TAG_EXISTS
        );
    }

    const slug = createSlug(name);
    const tag: ITag = await new Tag({ name, slug }).save();

    tag
        ? res.status(HTTP_STATUS.OK).json(tag)
        : sendErrorResponse(
              res,
              HTTP_STATUS.BAD_REQUEST,
              TAG_MESSAGES.TAG_CREATE_FAILED
          );
});

// Get all tags
export const getAllTags: RequestHandler = asyncHandler(async (_, res) => {
    const tags: ITag[] = await Tag.find({}).sort({ createdAt: -1 }).exec();
    res.status(HTTP_STATUS.OK).json(tags);
});

// Get single tag
export const getSingleTag: RequestHandler = asyncHandler(async (req, res) => {
    const slug = createSlug(req.params.slug);
    const tag: ITag | null = await Tag.findOne({ slug }).exec();

    tag
        ? res.status(HTTP_STATUS.OK).json(tag)
        : sendErrorResponse(
              res,
              HTTP_STATUS.NOT_FOUND,
              TAG_MESSAGES.TAG_NOT_FOUND
          );
});

// Update tag
export const updateTag: RequestHandler = asyncHandler(async (req, res) => {
    const { name } = req.body as TagRequest;
    const tagId = req.params.id;

    if (!validateName(name)) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            "Tag name is required"
        );
    }

    const updatedSlug = createSlug(name);

    const existingTag = await Tag.findOne({
        name,
        _id: { $ne: tagId },
    });

    if (existingTag) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            TAG_MESSAGES.TAG_EXISTS
        );
    }

    const updatedTag: ITag | null = await Tag.findByIdAndUpdate(
        tagId,
        { name, slug: updatedSlug },
        { new: true }
    );

    updatedTag
        ? res.status(HTTP_STATUS.OK).json(updatedTag)
        : sendErrorResponse(
              res,
              HTTP_STATUS.NOT_FOUND,
              TAG_MESSAGES.TAG_NOT_FOUND
          );
});

// Delete tag
export const deleteTag: RequestHandler = asyncHandler(async (req, res) => {
    const tagId = req.params.id;

    const deletedTag: ITag | null = await Tag.findByIdAndDelete(tagId);

    deletedTag
        ? res.status(HTTP_STATUS.OK).json({ message: TAG_MESSAGES.TAG_DELETED })
        : sendErrorResponse(
              res,
              HTTP_STATUS.NOT_FOUND,
              TAG_MESSAGES.TAG_NOT_FOUND
          );
});
