import { Request, RequestHandler, Response } from "express";
import mongoose, { Types, model } from "mongoose";
import _ from "lodash";
import formidable, { Fields, Files } from "formidable";
import { promises as fsPromises } from "fs";
import { Blog } from "../models/blogModel";
import { smartTrim, stripHtmlTags } from "../helpers/blog";
import { Category } from "../models/categoryModel";
import { Tag } from "../models/tagModel";
import asyncHandler from "express-async-handler";
import { ICategory, ITag } from "../interfaces";
import { IBlog, BlogRequest, UpdateBlogRequest } from "../interfaces/blog";
import { IUser } from "../interfaces/user";
import slugify from "slugify";

// Create blog
export const createBlog = async (
    req: Request,
    res: Response
): Promise<void> => {
    let form = formidable({
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024,
    });

    form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
        if (err) {
            res.status(400).json({ error: "Error processing form" });
            return;
        }

        const { title, content, categories, tags } =
            fields as unknown as BlogRequest;

        // Handle potential array values for title and content
        const actualTitle: string = Array.isArray(title) ? title[0] : title;
        const actualContent: string = Array.isArray(content)
            ? content[0]
            : content;

        // Validation
        if (!actualTitle || actualTitle.length < 1) {
            res.status(400).json({
                error: "Title is required and must be a string",
            });
            return;
        }

        if (!actualContent || actualContent.length < 30) {
            res.status(400).json({ error: "Content is too short" });
            return;
        }

        if (!categories || categories.length === 0) {
            res.status(400).json({
                error: "At least one category is required",
            });
            return;
        }
        if (!tags || tags.length === 0) {
            res.status(400).json({ error: "At least one tag is required" });
            return;
        }

        const slug: string = slugify(actualTitle).toLowerCase();
        const { _id } = req.user as IUser;

        const slugExists = await Blog.findOne({ slug });

        if (slugExists) {
            res.status(409).json({ message: "Title Already Present" });
            return;
        }

        const blog = new Blog({
            title: actualTitle,
            slug,
            content: actualContent,
            categories,
            tags,
            excerpt: smartTrim(actualContent, 120, " ", "..."),
            metaTitle: `${actualTitle} | React Next Blog`,
            metaDescription: stripHtmlTags(actualContent.substring(0, 160)),
            postedBy: _id,
        });

        // @ts-ignore
        if (blog.excerpt.length > 120) {
            // @ts-ignore
            blog.excerpt = blog.excerpt.substring(0, 117) + "...";
        }

        // Handle photo upload (if exists)
        if (files.photo && Array.isArray(files.photo)) {
            const photoFile: formidable.File = files.photo[0];
            if (photoFile.size > 5 * 1024 * 1024) {
                res.status(400).json({
                    error: "Image should be less than 5 MB in size",
                });
                return;
            }
            const fileBuffer = await fsPromises.readFile(photoFile.filepath);
            blog.photo = {
                data: fileBuffer,
                contentType: photoFile.mimetype || "image/jpeg",
            };
        }

        const savedBlog = await blog.save();
        res.status(201).json(savedBlog);
    });
};

// Get All Blogs with Tags and Categories
export const getAllBlogs: RequestHandler = asyncHandler(async (req, res) => {
    const { pageNumber, keyword } = req.query;

    const pageSize: number = 3;
    const page: number = Number(pageNumber) || 1;
    const newKeyword = keyword
        ? {
              $or: [
                  { title: { $regex: keyword, $options: "i" } },
                  { body: { $regex: keyword, $options: "i" } },
              ],
          }
        : {};
    const count: number = await Blog.countDocuments({ ...newKeyword });
    const skip: number = pageSize * (page - 1);

    const blogs = await Blog.find({ ...newKeyword })
        .populate<{ categories: ICategory[] }>("categories", "_id name slug")
        .populate<{ tags: ITag[] }>("tags", "_id name slug")
        .populate("postedBy", "_id name username")
        .select(
            "_id title slug body excerpt categories tags postedBy createdAt updatedAt"
        )
        .limit(pageSize)
        .skip(skip)
        .exec();

    const categories = await Category.find({}).exec();
    const tags = await Tag.find({}).exec();

    res.status(200).json({
        count,
        page,
        pages: Math.ceil(count / pageSize),
        blogs,
        categories,
        tags,
    });
});

// Get Single blogs
export const getSingleBlog: RequestHandler = asyncHandler(async (req, res) => {
    const slug: string = req.params.slug.toLowerCase();

    if (!slug) {
        res.status(400).json({ message: "Invalid slug provided" });
        return;
    }

    const blog: IBlog | null = await Blog.findOne({ slug })
        .populate("categories", "_id name slug")
        .populate("tags", "_id name slug")
        .populate("postedBy", "_id name username")
        .exec();

    if (!blog) {
        res.status(404).json({ message: "Blog not found" });
        return;
    }

    res.status(200).json(blog);
});

// Update Blog
export const updateBlog: RequestHandler = async (req, res) => {
    try {
        const blogId: string = req.params.id;

        const searchExistingBlog: IBlog | null = await Blog.findById(blogId);

        if (!searchExistingBlog) {
            res.status(404).json({ error: "Blog not found" });
            return;
        }

        // Formidable configuration
        const form = formidable({
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024, // 20MB
        });

        form.parse(
            req,
            async (err: Error | null, fields: Fields, files: Files) => {
                if (err) {
                    res.status(400).json({ error: "Error processing form" });
                    return;
                }
                const { title, content, categories, tags } =
                    fields as unknown as UpdateBlogRequest;

                // Handle potential array values for title and content
                const actualTitle = Array.isArray(title) ? title[0] : title;
                const actualContent = Array.isArray(content)
                    ? content[0]
                    : content;

                try {
                    const existingBlog = await Blog.findById(blogId);

                    if (!existingBlog) {
                        return res
                            .status(404)
                            .json({ message: "Blog not found" });
                    }

                    // Update only if provided
                    if (actualTitle) {
                        existingBlog.title = actualTitle;
                        existingBlog.slug = slugify(actualTitle).toLowerCase();
                    }
                    if (actualContent) {
                        existingBlog.content = actualContent;
                        existingBlog.excerpt = smartTrim(
                            actualContent,
                            120,
                            " ",
                            "..."
                        );
                        existingBlog.metaTitle = `${actualTitle || existingBlog.title} | React Next Blog`;
                        existingBlog.metaDescription = stripHtmlTags(
                            actualContent.substring(0, 160)
                        );
                    }

                    if (categories !== undefined) {
                        const existingCategoryIds = existingBlog.categories.map(
                            (c) => c.toString()
                        );
                        // @ts-ignore
                        const newCategoryIds = categories.map((c: string) =>
                            c.trim()
                        );

                        const combinedCategories = [
                            ...existingCategoryIds,
                            ...newCategoryIds,
                        ];
                        const uniqueCategories = [
                            ...new Set(combinedCategories),
                        ];

                        existingBlog.categories = uniqueCategories.map(
                            (id) => new mongoose.Types.ObjectId(id)
                        );
                    }

                    if (tags !== undefined) {
                        const existingTagIds = existingBlog.tags.map((t) =>
                            t.toString()
                        );
                        // @ts-ignore
                        const newTagIds = tags.map((t: string) => t.trim());

                        const combinedTags = [...existingTagIds, ...newTagIds];
                        const uniqueTags = [...new Set(combinedTags)];

                        existingBlog.tags = uniqueTags.map(
                            (id) => new mongoose.Types.ObjectId(id)
                        );
                    }

                    // Process photo
                    if (files.photo && Array.isArray(files.photo)) {
                        const photoFile: formidable.File = Array.isArray(
                            files.photo
                        )
                            ? files.photo[0]
                            : files.photo;

                        if (photoFile.size > 5 * 1024 * 1024) {
                            return res.status(400).json({
                                error: "Image should be less than 20MB",
                            });
                        }

                        const fileBuffer = await fsPromises.readFile(
                            photoFile.filepath
                        );
                        existingBlog.photo = {
                            data: fileBuffer,
                            contentType: photoFile.mimetype || "image/jpeg",
                        };
                    }

                    // Save updated blog
                    const updatedBlog = await existingBlog.save();
                    res.status(200).json(updatedBlog);
                } catch (error) {
                    res.status(400).json({
                        error: error,
                    });
                }
            }
        );
    } catch (error) {
        res.status(500).json({
            error: "Server error updating blog",
        });
    }
};

// Delete Blog
export const deleteBlog: RequestHandler = asyncHandler(async (req, res) => {
    const slug: string = req.params.slug.toLowerCase();

    if (!slug) {
        res.status(400).json({ message: "Invalid slug provided" });
        return;
    }

    const blog = await Blog.findOneAndDelete({ slug });

    if (!blog) {
        res.status(404).json({
            message: "Blog not found or already been deleted",
        });
        return;
    }

    res.status(200).json({ message: "Blog deleted successful" });
});

// Get Blog Image
export const getBlogPhoto: RequestHandler = asyncHandler(async (req, res) => {
    const slug: string = req.params.slug.toLowerCase();

    if (!slug) {
        res.status(400).json({ message: "Invalid slug provided" });
        return;
    }

    const blog = await Blog.findOne({ slug }).select("photo").exec();

    if (!blog) {
        res.status(400).json({ message: "Blog not found" });
        return;
    }

    if (!blog.photo) {
        res.status(404).json({ error: "User photo not found" });
        return;
    }

    const contentType: string = blog.photo.contentType.toString();

    res.set("Content-Type", contentType);
    res.send(blog.photo.data);
});

// Get Related Blogs
export const getRelatedBlogs: RequestHandler = asyncHandler(
    async (req, res) => {
        let limit: number = req.body.limit ? Number(req.body.limit) : 4;

        const { _id, category } = req.body;

        if (!_id || !category || typeof category !== "string") {
            res.status(400).json({
                message:
                    "Invalid request. Blog ID and a category are required.",
            });
            return;
        }

        // Check if the provided category ID is valid
        if (!Types.ObjectId.isValid(category)) {
            res.status(400).json({ message: "Invalid category ID." });
            return;
        }

        try {
            const categoryId = new Types.ObjectId(category);

            const relatedBlogs = await Blog.find({
                _id: { $ne: _id },
                categories: categoryId,
            })
                .limit(limit)
                .populate("tags", "_id name slug")
                .populate("postedBy", "_id name username")
                .select("title slug excerpt postedBy createdAt updatedAt")
                .exec();

            if (relatedBlogs.length === 0) {
                res.status(404).json({ message: "No related blogs found." });
                return;
            }

            res.status(200).json(relatedBlogs);
        } catch (error) {
            res.status(500).json({
                message: "An error occurred while fetching related blogs.",
                error,
            });
        }
    }
);

// Search Blogs
export const searchBlogs: RequestHandler = asyncHandler(async (req, res) => {
    const { keyword } = req.query;

    if (!keyword || typeof keyword !== "string") {
        res.status(400).json({
            message: "Search query is required and must be a string.",
        });
        return;
    }

    const blogs = await Blog.find({
        $or: [
            { title: { $regex: keyword, $options: "i" } },
            { body: { $regex: keyword, $options: "i" } },
        ],
    })
        .select("-photo -body")
        .exec();

    if (blogs.length === 0) {
        res.status(404).json({
            message: "No blogs found matching the search query.",
        });
        return;
    }

    res.status(200).json(blogs);
});
