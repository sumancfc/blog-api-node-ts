const express = require("express");
const router = express.Router();

const {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category");

const { runValidation } = require("../validators");
const { categoryValidation } = require("../validators/category");

const { requireSignin, adminMiddleware } = require("../controllers/auth");

router.post(
  "/category",
  categoryValidation,
  runValidation,
  requireSignin,
  adminMiddleware,
  createCategory
);
router.get("/categories", getAllCategories);
router.get("/category/:slug", getSingleCategory);
router.put("/category/:slug", requireSignin, adminMiddleware, updateCategory);
router.delete(
  "/category/:slug",
  requireSignin,
  adminMiddleware,
  deleteCategory
);

module.exports = router;
