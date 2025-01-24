import express, { Router } from "express";
import {
    signUp,
    signIn,
    verifyEmail,
    signOut,
    forgotPassword,
    resetPassword,
} from "../controllers/auth";
import { runValidation } from "../validators";
import { userSignUpValidation, userSignInValidation } from "../validators/auth";
import {
    forgotPasswordLimiter,
    resetPasswordLimiter,
    signInLimiter,
    signUpLimiter,
} from "../middlewares/rateLimiter";

const router: Router = express.Router();

// Auth Routes
router.post(
    "/register",
    signUpLimiter,
    userSignUpValidation,
    runValidation,
    signUp
);
router.post(
    "/login",
    signInLimiter,
    userSignInValidation,
    runValidation,
    signIn
);
router.get("/email-verify/:id", verifyEmail);
router.get("/logout", signOut);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPasswordLimiter, resetPassword);

export default router;
