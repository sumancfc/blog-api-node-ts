import express, { Router } from "express";
import {
    postComment,
    postReply,
    getCommentsForBlog,
    deleteComment,
} from "../controllers/comment.controller";
import {
    authorizeRoles,
    requireSignIn,
} from "./../controllers/auth.controller";
import { UserRole } from "../interfaces/user.interface";

const router: Router = express.Router();

router.post("/:blogId/create", requireSignIn, postComment);
router.post("/:commentId/replies", requireSignIn, postReply);
router.get("/:blogId", requireSignIn, getCommentsForBlog);
router.delete(
    "/:commentId",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.AUTHOR, UserRole.ADMIN),
    deleteComment
);

export default router;
