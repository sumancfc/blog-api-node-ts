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

const router: Router = express.Router();

// Tag routes
router.post(
    "/",
    categoryAndTagValidation,
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    createTag
);
router.get("/all", getAllTags);
router.get("/:slug", getSingleTag);
router.put(
    "/:id",
    categoryAndTagValidation,
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    updateTag
);
router.delete("/:id", requireSignIn, authorizeRoles(UserRole.ADMIN), deleteTag);

export default router;
