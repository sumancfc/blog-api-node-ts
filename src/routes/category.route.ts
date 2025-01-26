import express, { Router } from "express";
import {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller";
import { requireSignIn, authorizeRoles } from "../controllers/auth.controller";
import { UserRole } from "../interfaces/user.interface";
import { categoryAndTagValidation } from "../validators/common.validator";
import { runValidation } from "../validators";

const router: Router = express.Router();

// Category routes
router.post(
    "/",
    categoryAndTagValidation,
    runValidation,
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    createCategory
);
router.get("/all", getAllCategories);
router.get("/:slug", getSingleCategory);
router.put(
    "/:id",
    categoryAndTagValidation,
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    updateCategory
);
router.delete(
    "/:id",
    runValidation,
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    deleteCategory
);

export default router;
