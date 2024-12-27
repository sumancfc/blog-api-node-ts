import express, { Router } from "express";
import {
  createBlog,
  // getAllBlogs,
  // getAllBlogsCatsTags,
  // getSingleBlog,
  // updateBlog,
  // deleteBlog,
  // getPhoto,
  // getRelatedBlogs,
  // searchBlogs,
} from "../controllers/blog";
import {
  requireSignin,
  adminMiddleware,
  authorizeRoles,
} from "../controllers/auth";
import { UserRole } from "../models/userModel";

const router: Router = express.Router();

router.post("/create-blog", requireSignin, adminMiddleware, createBlog);
// router.get("/blogs", getAllBlogs);
// router.post("/blogs-categories-tags", getAllBlogsCatsTags);
// router.get("/blog/:slug", getSingleBlog);
// router.put("/blog/:slug", requireSignin, adminMiddleware, updateBlog);
// router.delete("/blog/:slug", requireSignin, adminMiddleware, deleteBlog);
// router.get("/blog/photo/:slug", getPhoto);
// router.post("/blogs/related", getRelatedBlogs);
// router.get("/blogs/search", searchBlogs);

export default router;
