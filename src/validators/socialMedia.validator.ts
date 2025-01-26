import { body, param, ValidationChain } from "express-validator";
import { SocialMedia } from "../models/socialMedia.model";

export const createSocialMediaValidator: ValidationChain[] = [
    body("name")
        .notEmpty()
        .withMessage("Social Media Name is required")
        .isString()
        .withMessage("Social Media Name must be a string")
        .isLength({ max: 50 })
        .withMessage("Name must be less than 50 characters")
        .custom(async (value: string): Promise<boolean> => {
            // Check if the social media name already exists
            const existingSocialMedia = await SocialMedia.findOne({
                name: value,
            });
            if (existingSocialMedia) {
                throw new Error("Social media name already exists");
            }
            return true;
        }),

    body("link")
        .notEmpty()
        .withMessage("Social Media Link is required")
        .isURL()
        .withMessage("Social Media Link must be a valid URL"),

    body("icon")
        .notEmpty()
        .withMessage("Social Icon is required")
        .isString()
        .withMessage("Social Icon must be a string"),
];

export const updateSocialMediaValidator: ValidationChain[] = [
    param("id").isMongoId().withMessage("Invalid social media ID"),

    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty")
        .isLength({ max: 50 })
        .withMessage("Name must be less than 50 characters")
        .custom(async (value: string, { req }) => {
            const existingSocialMedia = await SocialMedia.findOne({
                name: value,
                //@ts-ignore
                _id: { $ne: req.params.id },
            });
            if (existingSocialMedia) {
                throw new Error("Social media name already exists");
            }
            return true;
        }),

    body("link")
        .optional()
        .isURL()
        .withMessage("Social Media Link must be a valid URL"),

    body("icon")
        .optional()
        .isString()
        .withMessage("Social Icon must be a string"),
];

export const socialMediaByIdValidator: ValidationChain[] = [
    param("id")
        .isMongoId()
        .withMessage("Invalid social media ID")
        .custom(async (id: string) => {
            const socialMedia = await SocialMedia.findById(id);
            if (!socialMedia) {
                throw new Error("Social media not found");
            }
            return true;
        }),
];
