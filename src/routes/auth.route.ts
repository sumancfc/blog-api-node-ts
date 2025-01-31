import express, { Router } from "express";
import {
    signUp,
    signIn,
    verifyEmail,
    signOut,
    forgotPassword,
    resetPassword,
} from "../controllers/auth.controller";
import { runValidation } from "../validators";
import {
    userSignUpValidation,
    userSignInValidation,
} from "../validators/auth.validator";
import { rateLimiterConfig } from "../middlewares/rateLimiter.middleware";

const router: Router = express.Router();

// Auth Routes
router.post(
    "/register",
    rateLimiterConfig,
    userSignUpValidation,
    runValidation,
    signUp
);
router.post(
    "/login",
    rateLimiterConfig,
    userSignInValidation,
    runValidation,
    signIn
);
router.get("/email-verify/:username", verifyEmail);
router.get("/logout", signOut);
router.post("/forgot-password", rateLimiterConfig, forgotPassword);
router.post("/reset-password", rateLimiterConfig, resetPassword);

export default router;
