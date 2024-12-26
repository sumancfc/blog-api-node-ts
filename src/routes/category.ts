import express, { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category";
import { requireSignin, adminMiddleware } from "../controllers/auth";

const router: Router = express.Router();

// Category routes
router.post("/category", requireSignin, adminMiddleware, createCategory);

router.get("/categories", getAllCategories);

router.get("/category/:slug", getSingleCategory);

router.put("/category/:slug", requireSignin, adminMiddleware, updateCategory);

router.delete(
  "/category/:slug",
  requireSignin,
  adminMiddleware,
  deleteCategory
);

export default router;