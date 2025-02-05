import { Types } from "mongoose";
import { Comment } from "../models/comment.model";
import { Blog } from "../models/blog.model";
import {
    GetCommentsOptions,
    IComment,
    PaginatedCommentResult,
} from "../interfaces/comment.interface";
import { buildCommentTree } from "../utils/commentTree.util";

export const createComment = async (
    blogId: Types.ObjectId,
    userId: Types.ObjectId,
    content: string
): Promise<IComment> => {
    try {
        const comment = new Comment({
            content,
            commentedBy: userId,
            blog: blogId,
        });

        await comment.save();

        await Blog.findByIdAndUpdate(blogId, {
            $push: { comments: comment._id },
            $inc: { totalComments: 1 },
        });

        return comment;
    } catch (error) {
        console.error("Error in createComment:", error);
        throw new Error("Failed to create comment");
    }
};

export const addReply = async (
    parentCommentId: Types.ObjectId,
    userId: Types.ObjectId,
    content: string
): Promise<IComment> => {
    try {
        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
            throw new Error("Parent comment not found");
        }

        const reply = new Comment({
            content,
            commentedBy: userId,
            blog: parentComment.blog,
            parentComment: parentCommentId,
        });

        await reply.save();

        await Blog.findByIdAndUpdate(parentComment.blog, {
            $push: { comments: reply._id },
            $inc: { totalComments: 1 },
        });

        return reply;
    } catch (error) {
        console.error("Error in addReply:", error);
        throw new Error("Failed to add reply");
    }
};

export const getCommentsForBlog = async (
    blogId: Types.ObjectId,
    options: GetCommentsOptions
): Promise<PaginatedCommentResult> => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = options;

        const skip = (page - 1) * limit;
        const sort: { [key: string]: 1 | -1 } = {
            [sortBy]: sortOrder === "asc" ? 1 : -1,
        };

        const [rootComments, totalRootComments] = await Promise.all([
            Comment.find({ blog: blogId, parentComment: null })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate("commentedBy", "name username")
                .lean()
                .exec(),
            Comment.countDocuments({ blog: blogId, parentComment: null }),
            Comment.countDocuments({ blog: blogId }),
        ]);

        const commentIds = rootComments.map((comment) => comment._id);
        const replies = await Comment.find({
            blog: blogId,
            parentComment: { $in: commentIds },
        })
            .sort(sort)
            .populate("commentedBy", "name username")
            .lean()
            .exec();

        const allComments = [...rootComments, ...replies];
        const commentTree = buildCommentTree(allComments as IComment[]);

        return {
            comments: commentTree,
            totalRootComments,
        };
    } catch (error) {
        console.error("Error in getCommentsForBlog service:", error);
        throw new Error("Failed to retrieve comments for the blog");
    }
};
