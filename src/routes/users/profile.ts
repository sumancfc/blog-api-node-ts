import express, { Router } from "express";
import {
    requireSignIn,
    authorizeRoles,
} from "../../controllers/auth.controller";
import {
    getProfile,
    updateUserProfile,
    getUserProfile,
    getUserPhoto,
    userToFollow,
    followBack, unfollowUser,
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
router.post(
    "/follow/:userId",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    userToFollow
);
router.post('/follow-back/:userId', requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN), followBack);
router.delete('/unfollow/:userId', requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN), unfollowUser);

export default router;
