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
  getProfile,
  // userProfile,
  // updateUserProfile,
  // getUserPhoto,
} from "../controllers/user";
import { UserRole } from "../models/userModel";

const router: Router = express.Router();

// User Routes
router.get("/users", requireSignin, adminMiddleware, getAllUsers);
router.put(
  "/users/role",
  requireSignin,
  authorizeRoles(UserRole.ADMIN),
  updateUserRole
);

router.get("/profile", requireSignin, authMiddleware, getProfile);
// router.get("/user/:username", userProfile);
// router.put("/profile", requireSignin, authMiddleware, updateUserProfile);
// router.get("/user/photo/:username", getUserPhoto);

export default router;
