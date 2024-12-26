import { check, ValidationChain } from "express-validator";

export const categoryValidation: ValidationChain[] = [
  check("name").not().isEmpty().withMessage("Category name is required"),
];
