import { requireSignIn } from "./../controllers/auth.controller";
import express, { Router } from "express";
import { postComment } from "../controllers/comment.controller";

const router: Router = express.Router();

router.post("/:id/create", requireSignIn, postComment);

export default router;
