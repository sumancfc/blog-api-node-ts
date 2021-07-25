const express = require("express");
const router = express.Router();

const { signup, signin, signout } = require("../controllers/auth");

const { runValidation } = require("../validators");
const {
  userSignupValidation,
  userSigninValidation,
} = require("../validators/auth");

router.post("/signup", userSignupValidation, runValidation, signup);
router.post("/signin", userSigninValidation, runValidation, signin);
router.get("/signout", signout);

module.exports = router;
