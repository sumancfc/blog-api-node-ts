import { Types } from "mongoose";
import { IComment, CommentTreeItem } from "../interfaces/comment.interface";

export function buildCommentTree(comments: IComment[]): CommentTreeItem[] {
    const commentMap = new Map<string, CommentTreeItem>();
    const rootComments: CommentTreeItem[] = [];

    comments.forEach((comment) => {
        const commentItem: CommentTreeItem = {
            ...comment,
            _id: new Types.ObjectId(comment._id?.toString() || ""),
            replies: [],
        };
        commentMap.set(commentItem._id.toString(), commentItem);
    });

    comments.forEach((comment: any) => {
        if (comment.parentComment && comment.parentComment._id) {
            const parentId = comment.parentComment._id.toString();
            const parentComment = commentMap.get(parentId);
            if (parentComment) {
                parentComment.replies.push(
                    commentMap.get(
                        comment._id?.toString() || ""
                    ) as CommentTreeItem
                );
            } else {
                rootComments.push(
                    commentMap.get(
                        comment._id?.toString() || ""
                    ) as CommentTreeItem
                );
            }
        } else {
            rootComments.push(
                commentMap.get(comment._id?.toString() || "") as CommentTreeItem
            );
        }
    });

    return rootComments;
}
