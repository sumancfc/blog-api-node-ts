import { Response } from "express";
import nodemailer, { SentMessageInfo } from "nodemailer";
import { errorHandler } from "../middlewares/dbErrorHandler.middleware";
import { HTTP_STATUS, USER_MESSAGES } from "./statusMessage.util";

// Error handle
export const handleError = (res: Response, error: unknown) => {
    const errorMessage = errorHandler(error as Error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: errorMessage,
    });
};

// Cookies expiry
export const getExpirySettings = (keepMeLoggedIn?: boolean) => {
    const expiryDays: number = keepMeLoggedIn
        ? parseInt(process.env.COOKIE_EXPIRY_LONG || "30", 10)
        : parseInt(process.env.COOKIE_EXPIRY_SHORT || "1", 10);

    const expiresIn = `${expiryDays}d`; // For JWT
    const cookieMaxAge: number = expiryDays * 24 * 60 * 60 * 1000; // For cookies

    return { expiresIn, cookieMaxAge };
};

// Send Email to User
export const sendEmail = async (
    email: string,
    subject: string,
    message: string,
    res: Response
): Promise<void> => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: "User Management",
            to: email,
            subject: subject,
            html: message,
        };

        transporter.sendMail(
            mailOptions,
            (err: Error | null, info: SentMessageInfo) => {
                if (err) {
                    console.log(err);
                } else {
                    return res
                        .status(200)
                        .json({ message: USER_MESSAGES.EMAIL_SEND });
                }
            }
        );
    } catch (err) {
        console.log(err);
    }
};

export const validateName = (name: string): boolean => !!name?.trim();

export const createSlug = (name: string): string => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // Remove unwanted characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Condense multiple hyphens
        .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

// Send Error Response
export const sendErrorResponse = (
    res: Response,
    status: number,
    message: string
): void => {
    res.status(status).json({ message: message });
};

// Encode Email
export const encodeEmailForURL = (email: string) => {
    return encodeURIComponent(email);
};

// Generate Code
export const generateAlphanumericCode = (length: number): string => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code: string = "";

    for (let i: number = 0; i < length; i++) {
        const randomIndex: number = Math.floor(
            Math.random() * characters.length
        );
        code += characters[randomIndex];
    }
    return code;
};
