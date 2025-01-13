import express, { Router } from "express";
import {
  requireSignin,
  authMiddleware,
  adminMiddleware,
  authorizeRoles,
} from "../controllers/auth";
import {
  getAllUsers,
  updateUserRole,
  userProfile,
  getProfile,
  // updateUserProfile,
  // getUserPhoto,
} from "../controllers/user";
import { UserRole } from "../models/userModel";

const router: Router = express.Router();

// Admin User Routes
router.get("/admin/users", requireSignin, adminMiddleware, getAllUsers);
router.put(
  "/admin/users/:id/role",
  requireSignin,
  authorizeRoles(UserRole.ADMIN),
  updateUserRole
);

router.get(
  "/admin/user/:username",
  requireSignin,
  authorizeRoles(UserRole.ADMIN),
  userProfile
);
// router.put("/profile", requireSignin, authMiddleware, updateUserProfile);
// router.get("/user/photo/:username", getUserPhoto);

// User Routes
router.get("/profile", requireSignin, authMiddleware, getProfile);

export default router;
