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
router.post(
    "/admin/create-user",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    createUserValidation,
    runValidation,
    createUser
);
router.put(
    "/admin/user/:id/role",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    updateUserRole
);

// User Routes
router.get(
    "/profile",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    getProfile
);
router.get(
    "/profile/:username",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    getUserProfile
);
router.put(
    "/profile",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    updateUserProfile
);
router.delete(
    "/profile/:username",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    deleteUserProfile
);
router.get(
    "/photo/:username",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    getUserPhoto
);


export default router;
