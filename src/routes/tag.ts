import express, { Router } from "express";
import {
    createTag,
    getAllTags,
    getSingleTag,
    updateTag,
    deleteTag,
} from "../controllers/tag";
import { requireSignIn, authorizeRoles } from "../controllers/auth";
import { categoryAndTagValidation } from "../validators/cat_tag";
import { UserRole } from "../interfaces/user";

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
