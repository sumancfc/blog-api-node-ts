import express, { Router } from "express";
import {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/category";
import { requireSignIn, authorizeRoles } from "../controllers/auth";
import { UserRole } from "../interfaces/user";
import { categoryValidation } from "../validators/category";
import { runValidation } from "../validators";

const router: Router = express.Router();

// Category routes
router.post(
    "/",
    categoryValidation,
    runValidation,
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    createCategory
);
router.get("/all", getAllCategories);
router.get("/:slug", getSingleCategory);
router.put(
    "/:id",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    updateCategory
);
router.delete(
    "/:id",
    categoryValidation,
    runValidation,
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    deleteCategory
);


export default router;
