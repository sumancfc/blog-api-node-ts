import { check, ValidationChain } from "express-validator";

export const categoryValidation: ValidationChain[] = [
    check("name")
        .trim()
        .not().isEmpty().withMessage("Name is required")
        .isLength({ min: 2, max: 150 }).withMessage("Name must be between 2 and 150 characters")
        .matches(/^[a-zA-Z0-9 ]+$/).withMessage("Name can only contain letters, numbers, and spaces"),

    check("slug")
        .optional()
        .trim()
        .matches(/^[a-z0-9-]+$/).withMessage("Slug can only contain lowercase letters, numbers, and hyphens")
        .isLength({ max: 100 }).withMessage("Slug cannot exceed 100 characters"),
];
