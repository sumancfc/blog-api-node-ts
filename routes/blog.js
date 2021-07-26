const express = require("express");
const router = express.Router();

const {
  createBlog,
  getAllBlogs,
  getAllBlogsCatsTags,
} = require("../controllers/blog");

const { requireSignin, adminMiddleware } = require("../controllers/auth");

router.post("/create-blog", requireSignin, adminMiddleware, createBlog);
router.get("/blogs", getAllBlogs);
router.post("/blogs-categories-tags", getAllBlogsCatsTags);

module.exports = router;
