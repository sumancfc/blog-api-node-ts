import { Response } from "express";
import { errorHandler } from "../middlewares/dbErrorHandler";

interface CategoryRequest {
  name: string;
}

interface TagRequest {
  name: string;
}

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const CATEGORY_MESSAGES = {
  CATEGORY_EXISTS: "Category already exists.",
  CATEGORY_CREATE_FAILED: "Failed to create category!",
  CATEGORY_NOT_FOUND: "Category not found or already has been deleted!",
  CATEGORY_DELETED: "Category deleted successfully",
};

const TAG_MESSAGES = {
  TAG_EXISTS: "Tag already exists.",
  TAG_CREATE_FAILED: "Failed to create tag!",
  TAG_NOT_FOUND: "Tag not found or already has been deleted!",
  TAG_DELETED: "Tag deleted successfully",
};

const handleError = (res: Response, error: unknown) => {
  const errorMessage = errorHandler(error as Error);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: errorMessage });
};

export {
  CategoryRequest,
  TagRequest,
  HTTP_STATUS,
  CATEGORY_MESSAGES,
  TAG_MESSAGES,
  handleError,
};
