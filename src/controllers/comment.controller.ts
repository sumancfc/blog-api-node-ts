import { Request, Response } from "express";
import { createComment } from "../services/comment.service";
import { IUser } from "../interfaces/user.interface";
import { Types } from "mongoose";

export const postComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const blogId: Types.ObjectId = new Types.ObjectId(id);
        const { content } = req.body;

        const { _id } = req.user as IUser;
        const userId = _id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const comment = await createComment(blogId, userId, content);

        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ message: "Error creating comment" });
    }
};
