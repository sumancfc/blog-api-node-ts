import asyncHandler from "express-async-handler";
import { RequestHandler } from "express";
import { User } from "../models/user.model";
import { sendEmail } from "../utils";
import { subscribedToNewsletter } from "../utils/emailMessage.util";

// Subscribe to newsletter
export const subscribeToNewsletter: RequestHandler = asyncHandler(
    async (req, res) => {
        const { email } = req.body;

        if (!email) {
            res.json({ message: "Please enter a valid email." });
            return;
        }

        const user = await User.findOne({ email }).exec();
        // Check if user exists in database if not create or update eht database
        if (!user) {
            await new User({
                email,
                agreedToTerms: true,
                accountStatus: "active",
                newsletter_subscribed: true,
            }).save();
        } else {
            await User.updateOne(
                { email },
                { $set: { newsletter_subscribed: true } }
            );
        }

        const username: string = email.split("@")[0];
        const message: string = subscribedToNewsletter(
            user ? user.name : username
        );

        await sendEmail(email, "Newsletter Subscription", message, res);

        res.status(200).json({
            message: "You have successfully subscribed to our newsletter.",
        });
    }
);
