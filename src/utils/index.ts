import { Response } from "express";
import { errorHandler } from "../middlewares/dbErrorHandler";
import { HTTP_STATUS } from "./status_message";

// Error handle
export const handleError = (res: Response, error: unknown) => {
    const errorMessage = errorHandler(error as Error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: errorMessage });
};

// Cookies expiry
export const getExpirySettings = (keepMeLoggedIn?: boolean) => {
    const expiryDays = keepMeLoggedIn
        ? parseInt(process.env.COOKIE_EXPIRY_LONG || "30", 10)
        : parseInt(process.env.COOKIE_EXPIRY_SHORT || "1", 10);

    const expiresIn = `${expiryDays}d`; // For JWT
    const cookieMaxAge = expiryDays * 24 * 60 * 60 * 1000; // For cookies

    return { expiresIn, cookieMaxAge };
};
