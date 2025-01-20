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
router.get("/profile", requireSignIn, authorizeRoles(UserRole.USER), getProfile);
// router.put("/profile", requireSignIn, authMiddleware, updateUserProfile);
// router.get("/user/photo/:username", getUserPhoto);

export default router;
