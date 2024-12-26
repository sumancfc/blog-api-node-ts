const express = require("express");

const router = express.Router();

const {
  createTag,
  getAllTags,
  getSingleTag,
  updateTag,
  deleteTag,
} = require("../controllers/tag");
const { requireSignin, adminMiddleware } = require("../controllers/auth");

const { tagValidation } = require("../validators/tag");
const { runValidation } = require("../../validators");

router.post(
  "/tag",
  tagValidation,
  runValidation,
  requireSignin,
  adminMiddleware,
  createTag
);
router.get("/tags", getAllTags);
router.get("/tag/:slug", getSingleTag);
router.put("/tag/:slug", requireSignin, adminMiddleware, updateTag);
router.delete("/tag/:slug", requireSignin, adminMiddleware, deleteTag);

module.exports = router;
