import express, { Router } from "express";
import { createBlog, getAllBlogs } from "../controllers/blog";
import { requireSignIn, authorizeRoles } from "../controllers/auth";
import { UserRole } from "../interfaces/user";

const router: Router = express.Router();

router.post(
    "/create-blog",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    createBlog
);
router.get("/blogs", getAllBlogs);
// // router.post("/blogs-categories-tags", getAllBlogsCatsTags);
// // router.get("/blog/:slug", getSingleBlog);
// // router.put("/blog/:slug", requireSignin, adminMiddleware, updateBlog);
// // router.delete("/blog/:slug", requireSignin, adminMiddleware, deleteBlog);
// // router.get("/blog/photo/:slug", getPhoto);
// // router.post("/blogs/related", getRelatedBlogs);
// // router.get("/blogs/search", searchBlogs);

export default router;
