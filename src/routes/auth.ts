import express, { Router } from "express";
import { signup, signin, verifyEmail, signout } from "../controllers/auth";
import { runValidation } from "../validators";
import { userSignupValidation, userSigninValidation } from "../validators/auth";

const router: Router = express.Router();

// Auth Routes
router.post("/signup", userSignupValidation, runValidation, signup);
router.post("/signin", userSigninValidation, runValidation, signin);
router.get("/verify/:id", verifyEmail);
router.get("/signout", signout);

export default router;
