import express, { Router } from "express";
import {
    createTag,
    getAllTags,
    getSingleTag,
    updateTag,
    deleteTag,
} from "../controllers/tag.controller";
import { requireSignIn, authorizeRoles } from "../controllers/auth.controller";
import { categoryAndTagValidation } from "../validators/common.validator";
import { UserRole } from "../interfaces/user.interface";
import { runValidation } from "../validators";
import { rateLimiterConfig } from "../middlewares/rateLimiter.middleware";

const router: Router = express.Router();

// Tag routes
router.post(
    "/",
    rateLimiterConfig,
    requireSignIn,
    categoryAndTagValidation,
    runValidation,
    authorizeRoles(UserRole.ADMIN),
    createTag
);
router.get("/all", getAllTags);
router.get("/:slug", getSingleTag);
router.put(
    "/:id",
    rateLimiterConfig,
    requireSignIn,
    categoryAndTagValidation,
    runValidation,
    authorizeRoles(UserRole.ADMIN),
    updateTag
);
router.delete(
    "/:id",
    rateLimiterConfig,
    requireSignIn,
    categoryAndTagValidation,
    runValidation,
    authorizeRoles(UserRole.ADMIN),
    deleteTag
);

export default router;
