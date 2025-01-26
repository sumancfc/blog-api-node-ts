import express, { Router } from "express";
import {
    createSocialMedia,
    getAllSocialMedias,
    getSocialMediaByID,
    updateSocialMedia,
    deleteSocialMedia,
} from "../controllers/admin/socialmedia";
import { requireSignIn, authorizeRoles } from "../controllers/auth.controller";
import { UserRole } from "../interfaces/user.interface";
import {
    createSocialMediaValidator,
    updateSocialMediaValidator,
    socialMediaByIdValidator,
} from "../validators/socialMedia.validator";
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
    getAllSocialMedias
);
router.get(
    "/:id",
    socialMediaByIdValidator,
    runValidation,
    requireSignIn,
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
