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
} from "../controllers/blog.controller";
import { requireSignIn, authorizeRoles } from "../controllers/auth.controller";
import { UserRole } from "../interfaces/user.interface";
import { rateLimiterConfig } from "../middlewares/rateLimiter.middleware";

const router: Router = express.Router();

router.post(
    "/create",
    requireSignIn,
    rateLimiterConfig,
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
router.get("/photo/:slug", getBlogPhoto);
router.post("/related-blog", getRelatedBlogs);
router.get("/search", searchBlogs);

export default router;
