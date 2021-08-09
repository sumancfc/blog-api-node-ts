const express = require("express");
const router = express.Router();

const { requireSignin, authMiddleware } = require("../controllers/auth");
const {
  read,
  userProfile,
  updateUserProfile,
  getUserPhoto,
} = require("../controllers/user");

router.get("/profile", requireSignin, authMiddleware, read);
router.get("/user/:username", userProfile);
router.put("/profile", requireSignin, authMiddleware, updateUserProfile);
router.get("/user/photo/:username", getUserPhoto);

module.exports = router;
