import express, { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category";
import { requireSignin, authorizeRoles } from "../controllers/auth";
import { UserRole } from "../models/userModel";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API to manage categories
 */

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully created category
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/category",
  requireSignin,
  authorizeRoles(UserRole.ADMIN),
  createCategory
);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 */
router.get("/categories", getAllCategories);

/**
 * @swagger
 * /category/{slug}:
 *   get:
 *     summary: Get a single category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: The slug of the category
 *     responses:
 *       200:
 *         description: Successfully retrieved category
 *       404:
 *         description: Category not found
 */
router.get("/category/:slug", getSingleCategory);

/**
 * @swagger
 * /category/{id}:
 *   put:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated category
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/category/:id",
  requireSignin,
  authorizeRoles(UserRole.ADMIN),
  updateCategory
);

router.delete(
  "/category/:id",
  requireSignin,
  authorizeRoles(UserRole.ADMIN),
  deleteCategory
);

export default router;
