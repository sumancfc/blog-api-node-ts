import express, { Router } from "express";
import {
    createBlog,
    getAllBlogs,
    getSingleBlog,
    updateBlog,
    deleteBlog,
    getBlogPhoto,
    getRelatedBlogs,
    searchBlogs,
} from "../controllers/blog";
import { requireSignIn, authorizeRoles } from "../controllers/auth";
import { UserRole } from "../interfaces/user";

const router: Router = express.Router();

router.post(
    "/create",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    createBlog
);
router.get("/all", getAllBlogs);
router.get("/:slug", getSingleBlog);
router.put("/:id", requireSignIn, authorizeRoles(UserRole.ADMIN), updateBlog);
router.delete(
    "/:slug",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    deleteBlog
);
router.get("/blog/photo/:slug", getBlogPhoto);
router.post("/blogs/related", getRelatedBlogs);
router.get("/blogs/search", searchBlogs);

export default router;
