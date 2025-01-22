import express, { Router } from "express";
import { createBlog, getAllBlogs, getSingleBlog, deleteBlog } from "../controllers/blog";
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
router.get("/blog/:slug", getSingleBlog);
// // router.put("/blog/:slug", requireSignin, adminMiddleware, updateBlog);
router.delete("/blog/:slug", requireSignIn, authorizeRoles(UserRole.ADMIN), deleteBlog);
// // router.get("/blog/photo/:slug", getPhoto);
// // router.post("/blogs/related", getRelatedBlogs);
// // router.get("/blogs/search", searchBlogs);

export default router;
