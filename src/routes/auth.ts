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

const router: Router = express.Router();

// Auth Routes
router.post("/signup", userSignupValidation, runValidation, signup);
router.post("/signin", userSigninValidation, runValidation, signin);
router.get("/verify/:id", verifyEmail);
router.get("/signout", signout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
