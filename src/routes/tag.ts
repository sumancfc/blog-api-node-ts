import express, { Router } from "express";
import {
    createTag,
    getAllTags,
    getSingleTag,
    updateTag,
    deleteTag,
} from "../controllers/tag";
import { requireSignIn, authorizeRoles } from "../controllers/auth";
import { UserRole } from "../interfaces/user";

const router: Router = express.Router();

// Tag routes
router.post("/tag", requireSignIn, authorizeRoles(UserRole.ADMIN), createTag);
router.get("/tags", getAllTags);
router.get("/tag/:slug", getSingleTag);
router.put(
    "/tag/:id",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    updateTag
);
router.delete(
    "/tag/:id",
    requireSignIn,
    authorizeRoles(UserRole.ADMIN),
    deleteTag
);

export default router;
