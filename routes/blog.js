const express = require("express");
const router = express.Router();

const { createBlog } = require("../controllers/blog");

const { requireSignin, adminMiddleware } = require("../controllers/auth");

router.post("/create-blog", requireSignin, adminMiddleware, createBlog);

module.exports = router;
