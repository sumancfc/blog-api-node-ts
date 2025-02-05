import { Request, Response } from "express";
import { Types } from "mongoose";
import * as commentService from "../services/comment.service";
import { IUser } from "../interfaces/user.interface";
import { Blog } from "../models/blog.model";

export const postComment = async (req: Request, res: Response) => {
    try {
        const { blogId } = req.params;
        const { content } = req.body;
        const user = req.user as IUser | undefined;

        if (!user || !user._id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!blogId || !Types.ObjectId.isValid(blogId)) {
            res.status(400).json({ message: "Invalid blog ID" });
            return;
        }

        if (!content || typeof content !== "string") {
            res.status(400).json({ message: "Invalid comment content" });
            return;
        }

        const comment = await commentService.createComment(
            new Types.ObjectId(blogId),
            user._id,
            content
        );

        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ message: "Error creating comment" });
    }
};

export const postReply = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const user = req.user as IUser | undefined;

        if (!user || !user._id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!commentId || !Types.ObjectId.isValid(commentId)) {
            res.status(400).json({ message: "Invalid comment ID" });
            return;
        }

        if (!content || typeof content !== "string") {
            res.status(400).json({ message: "Invalid reply content" });
            return;
        }

        const reply = await commentService.addReply(
            new Types.ObjectId(commentId),
            user._id,
            content
        );

        res.status(201).json(reply);
    } catch (error) {
        res.status(500).json({ message: "Error adding reply" });
    }
};

export const getCommentsForBlog = async (req: Request, res: Response) => {
    try {
        const blogId = new Types.ObjectId(req.params.blogId);
        const options = {
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 3,
            sortBy: (req.query.sortBy as string) || "createdAt",
            sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
        };

        const [result, blog] = await Promise.all([
            commentService.getCommentsForBlog(blogId, options),
            Blog.findById(blogId).select("totalComments").lean(),
        ]);

        if (!blog) {
            res.status(404).json({ message: "Blog not found" });
            return;
        }

        const totalPages = Math.ceil(blog.totalComments / options.limit);

        res.status(200).json({
            comments: result.comments,
            metadata: {
                totalComments: blog.totalComments,
                currentPage: options.page,
                limit: options.limit,
                sortBy: options.sortBy,
                sortOrder: options.sortOrder,
                totalPages: totalPages,
            },
        });
    } catch (error) {
        console.error("Error in getCommentsForBlog controller:", error);
        res.status(500).json({
            message: "Error retrieving comments for the blog",
        });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const commentId = new Types.ObjectId(req.params.commentId);
        const { _id, role } = req.user as IUser;
        const userId = _id;
        const userRole = role;

        const result = await commentService.deleteComment(
            commentId,
            userId,
            userRole
        );

        res.status(200).json({
            message: result.message,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("Error in deleteComment controller:", error);
        if (error instanceof Error && error.message === "Comment not found") {
            res.status(404).json({ message: "Comment not found" });
        } else if (
            error instanceof Error &&
            error.message === "Unauthorized to delete this comment"
        ) {
            res.status(403).json({
                message: "Unauthorized to delete this comment",
            });
        } else {
            res.status(500).json({ message: "Error deleting comment" });
        }
    }
};
