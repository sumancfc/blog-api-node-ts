import express, { Router } from "express";
import {
    createSocialMedia,
    getAllSocialMedias,
    getSocialMediaByID,
    updateSocialMedia,
    deleteSocialMedia,
} from "../controllers/socialmedia";
import { requireSignIn, authorizeRoles } from "../controllers/auth";
import { UserRole } from "../interfaces/user";
import {
    createSocialMediaValidator,
    updateSocialMediaValidator,
    socialMediaByIdValidator,
} from "../validators/socialmedia";
import { runValidation } from "../validators";

const router: Router = express.Router();

// Social Media routes
router.post(
    "/",
    createSocialMediaValidator,
    runValidation,
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    createSocialMedia
);
router.get(
    "/all",
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    getAllSocialMedias
);
router.get(
    "/:id",
    socialMediaByIdValidator,
    runValidation,
    requireSignIn,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
    getSocialMediaByID
);
router.put(
    "/:id",
    updateSocialMediaValidator,
    runValidation,
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    updateSocialMedia
);
router.delete(
    "/:id",
    socialMediaByIdValidator,
    runValidation,
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    deleteSocialMedia
);

export default router;
