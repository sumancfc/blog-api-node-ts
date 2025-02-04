import { Request, Response } from "express";
import { addReply, createComment } from "../services/comment.service";
import { IUser } from "../interfaces/user.interface";
import { Types } from "mongoose";

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

        const comment = await createComment(
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

        const reply = await addReply(
            new Types.ObjectId(commentId),
            user._id,
            content
        );

        res.status(201).json(reply);
    } catch (error) {
        res.status(500).json({ message: "Error adding reply" });
    }
};
