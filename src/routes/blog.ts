const express = require("express");
const router = express.Router();

const {
  createBlog,
  getAllBlogs,
  getAllBlogsCatsTags,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  getPhoto,
  getRelatedBlogs,
  searchBlogs,
} = require("../controllers/blog");

const { requireSignin, adminMiddleware } = require("../controllers/auth");

router.post("/create-blog", requireSignin, adminMiddleware, createBlog);
router.get("/blogs", getAllBlogs);
router.post("/blogs-categories-tags", getAllBlogsCatsTags);
router.get("/blog/:slug", getSingleBlog);
router.put("/blog/:slug", requireSignin, adminMiddleware, updateBlog);
router.delete("/blog/:slug", requireSignin, adminMiddleware, deleteBlog);
router.get("/blog/photo/:slug", getPhoto);
router.post("/blogs/related", getRelatedBlogs);
router.get("/blogs/search", searchBlogs);

module.exports = router;
