import express, { Router } from "express";
import {
    requireSignIn,
    authorizeRoles,
    //isOwnerOrAdmin,
} from "../controllers/auth";
import {
    getAllUsers,
    updateUserRole,
    userProfile,
    getProfile,
    updateUserProfile,
    getUserPhoto
} from "../controllers/user";
import { UserRole } from "../interfaces/user";

const router: Router = express.Router();

// Admin User Routes
router.get("/admin/users", requireSignIn, authorizeRoles(UserRole.ADMIN), getAllUsers);
router.put(
    "/admin/users/:id/role",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    updateUserRole
);
router.get(
    "/admin/user/:username",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    userProfile
);

// User Routes
router.get("/user/profile", requireSignIn, authorizeRoles(UserRole.USER, UserRole.ADMIN), getProfile);
// router.get("/user/profile:username", requireSignIn, authorizeRoles(UserRole.USER, UserRole.ADMIN), getUserProfile);
router.put("/user/profile", requireSignIn, authorizeRoles(UserRole.USER, UserRole.ADMIN), updateUserProfile);
router.get("/user/photo/:username", requireSignIn, authorizeRoles(UserRole.USER, UserRole.ADMIN), getUserPhoto);

export default router;
