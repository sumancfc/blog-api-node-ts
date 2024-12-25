import express from "express";
import { signup, signin } from "../controllers/auth";
import {runValidation} from "../validators";
import { userSignupValidation, userSigninValidation } from "../validators/auth";

const router = express.Router();

// Auth Routes
router.post("/signup", userSignupValidation, runValidation, signup);
router.post("/signin", userSigninValidation, runValidation, signin);
// router.get("/signout", signout);

export default router;
