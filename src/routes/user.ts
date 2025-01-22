import express, { Router } from "express";
import {
    requireSignIn,
    authorizeRoles,
    //isOwnerOrAdmin,
} from "../controllers/auth";
import {
    getAllUsers,
    updateUserRole,
    getProfile,
    updateUserProfile,
    getUserPhoto,
    createUser,
    getUserProfile,
    deleteUserProfile,
} from "../controllers/user";
import { UserRole } from "../interfaces/user";
import { createUserValidation } from "../validators/user";
import { runValidation } from "../validators";

const router: Router = express.Router();

// Admin User Routes
router.get(
    "/admin/users",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    getAllUsers
);
router.put(
    "/admin/users/:id/role",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    updateUserRole
);
router.post(
    "/admin/create-user",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    createUserValidation,
    runValidation,
    createUser
);

// User Routes
router.get(
    "/user/profile",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    getProfile
);
router.get(
    "/user/profile/:username",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    getUserProfile
);
router.put(
    "/user/profile",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    updateUserProfile
);
router.get(
    "/user/photo/:username",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    getUserPhoto
);
router.delete(
    "/user/profile/:username",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    deleteUserProfile
);

export default router;
