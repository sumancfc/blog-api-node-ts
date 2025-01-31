import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { Request } from "express";

const allowlist: string[] = process.env.TRUSTED_IP_ADDRESS ?
    process.env.TRUSTED_IP_ADDRESS.split(',').map(ip => ip.trim()) :
    [];

export const signUpLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 2,
    message: {
        message:
            "Too many signup attempts from this IP. Please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
        const clientIp = req.ip;
        console.log(req.ip)
        return clientIp ? allowlist.includes(clientIp) : false;
    },
});

export const signInLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 2,
    message: {
        message:
            "Too many login attempts from this IP. Please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
        const clientIp = req.ip;
        return clientIp ? allowlist.includes(clientIp) : false;
    },
});

export const forgotPasswordLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 2,
    message: {
        message:
            "Too many password forgot requests. Please try again after an hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const resetPasswordLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 2,
    message: {
        message:
            "Too many password reset requests. Please try again after an hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
