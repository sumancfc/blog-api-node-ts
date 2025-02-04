import { Types } from "mongoose";
import { Comment } from "../models/comment.model";
import { Blog } from "../models/blog.model";
import { IComment } from "../interfaces/comment.interface";

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
        });

        return reply;
    } catch (error) {
        console.error("Error in addReply:", error);
        throw new Error("Failed to add reply");
    }
};
