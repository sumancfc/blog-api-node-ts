import express, { Router } from "express";
import {
    requireSignIn,
    authorizeRoles,
} from "../../controllers/auth.controller";
import {
    getProfile,
    updateUserProfile,
    getUserProfile,
    deleteUserProfile, getUserPhoto,
} from "../../controllers/users/user";
import { UserRole } from "../../interfaces/user.interface";

const router: Router = express.Router();

// User Routes
router.get(
    "/",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    getProfile
);
router.get(
    "/photo/:username",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    getUserPhoto
);
router.get(
    "/:username",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    getUserProfile
);
router.put(
    "/",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    updateUserProfile
);

export default router;
