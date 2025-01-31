import express, { Router } from "express";
import {
    requireSignIn,
    authorizeRoles,
} from "../../controllers/auth.controller";
import {
    getAllUsers,
    updateUserRole,
    createUser,
    deleteUserProfile,
} from "../../controllers/users/user";
import { UserRole } from "../../interfaces/user.interface";
import { createUserValidation } from "../../validators/user.validator";
import { runValidation } from "../../validators";

const router: Router = express.Router();

// Admin User Routes
router.get("/all", requireSignIn, authorizeRoles(UserRole.ADMIN), getAllUsers);
router.post(
    "/create",
    requireSignIn,
    createUserValidation,
    runValidation,
    authorizeRoles(UserRole.ADMIN),
    createUser
);
router.put(
    "/:id/role",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    updateUserRole
);
router.delete(
    "/:username",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    deleteUserProfile
);

export default router;
