import { check, ValidationChain } from "express-validator";
import { UserRole, Gender } from "../interfaces/user";

export const createUserValidation: ValidationChain[] = [
    check("name").not().isEmpty().withMessage("Name is required"),
    check("email")
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Must be a valid email address"),
    check("password")
        .not()
        .isIn(["123456", "password", "god", "abcdef"])
        .withMessage("Do not use a common word as the password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .matches(/\d/)
        .withMessage("Password must contain a digit"),
    check("role")
        .isIn(Object.values(UserRole))
        .withMessage(
            `Role must be one of the following: ${Object.values(UserRole).join(", ")}`
        ),
    check("gender")
        .optional()
        .isIn(Object.values(Gender))
        .withMessage(
            `Gender must be one of the following: ${Object.values(Gender).join(", ")}`
        ),
];
