import express, { Router } from "express";
import { subscribeToNewsletter } from "../controllers/newsletter.controller";
import { runValidation } from "../validators";

// TO DOS
// To create a new route
// Does not require a sign in
// Requires an email
// On Post request
// 1. Set newsletter subscribed to true
// 2. Send a node mailer email to the user.
// 3. Create a controller.
// 4. Update the database for the user

const router: Router = express.Router();

router.post(
    "/",
    runValidation,
    subscribeToNewsletter
);

export default router;