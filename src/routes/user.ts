import express, { Router } from "express";
import {
    requireSignIn,
    authorizeRoles,
} from "../controllers/auth";
import {
    getAllUsers,
    updateUserRole,
    userProfile,
    getProfile,
    updateUserProfile
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
router.put("/user/profile", requireSignIn, authorizeRoles(UserRole.USER, UserRole.ADMIN), updateUserProfile);
// router.get("/user/photo/:username", getUserPhoto);

export default router;
