import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { Request } from "express";

const allowlist: string[] = process.env.TRUSTED_IP_ADDRESS
    ? process.env.TRUSTED_IP_ADDRESS.split(",").map((ip) => ip.trim())
    : [];

const skipRateLimiting = (req: Request): boolean => {
    const forwarded = req.headers["x-forwarded-for"] as string;
    const clientIp: string | undefined = forwarded
        ? forwarded.split(",")[0].trim()
        : req.socket.remoteAddress;

    console.log(
        `Client IP: ${clientIp}, Allowlisted: ${allowlist.includes(clientIp as string)}`
    );

    return clientIp ? allowlist.includes(clientIp as string) : false;
};

export const rateLimiterConfig: RateLimitRequestHandler = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 2,
    message: {
        message:
            "Too many password reset requests. Please try again after an hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipRateLimiting,
});
