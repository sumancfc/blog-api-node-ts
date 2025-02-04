import { Schema, Types } from "mongoose";
import { IComment } from "../interfaces/comment.interface";
import { Comment } from "../models/comment.model";
import { Blog } from "../models/blog.model";

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

        const blog = await Blog.findById(blogId);
        if (blog) {
            blog.comments.push(comment._id);
            await blog.save();
        } else {
            throw new Error("Blog not found");
        }

        return comment;
    } catch (error) {
        throw new Error("Failed to create comment.");
    }
};
