import express, { Router } from "express";
import {
    signup,
    signin,
    verifyEmail,
    signout,
    forgotPassword,
    resetPassword,
} from "../controllers/auth";
import { runValidation } from "../validators";
import { userSignupValidation, userSigninValidation } from "../validators/auth";
import { forgotPasswordLimiter, resetPasswordLimiter, signInLimiter, signUpLimiter } from "../middlewares/rateLimiter";

const router: Router = express.Router();

// Auth Routes
router.post("/signup", signUpLimiter, userSignupValidation, runValidation, signup);
router.post("/signin", signInLimiter, userSigninValidation, runValidation, signin);
router.get("/verify/:id", verifyEmail);
router.get("/signout", signout);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPasswordLimiter,resetPassword);

export default router;
