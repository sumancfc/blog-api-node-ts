import express, { Router } from "express";
import {
  createTag,
  getAllTags,
  getSingleTag,
  updateTag,
  deleteTag,
} from "../controllers/tag";
import { requireSignin, adminMiddleware } from "../controllers/auth";

const router: Router = express.Router();

// Tag routes
router.post("/tag", requireSignin, adminMiddleware, createTag);
router.get("/tags", getAllTags);
router.get("/tag/:slug", getSingleTag);
router.put("/tag/:id", requireSignin, adminMiddleware, updateTag);
router.delete("/tag/:id", requireSignin, adminMiddleware, deleteTag);

export default router;
