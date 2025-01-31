import express, { Router } from "express";
import profileRoutes from "./profile";

const router: Router = express.Router();

router.use("/profile", profileRoutes);

export default router;
