import express, { Router } from "express";
import { postComment, postReply } from "../controllers/comment.controller";
import { requireSignIn } from "./../controllers/auth.controller";

const router: Router = express.Router();

router.post("/:blogId/create", requireSignIn, postComment);
router.post("/:commentId/replies", requireSignIn, postReply);

export default router;
