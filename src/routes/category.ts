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

const router: Router = express.Router();

// Categories route
router.post(
    "/category",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    createCategory
);
router.get("/categories", getAllCategories);
router.get("/category/:slug", getSingleCategory);
router.put(
    "/category/:id",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    updateCategory
);
router.delete(
    "/category/:id",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    deleteCategory
);

export default router;
