import { Response } from "express";

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
    res.status(status).json({ error: message });
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
