import { check, ValidationChain } from "express-validator";

export const tagValidation: ValidationChain[] = [
  check("name").not().isEmpty().withMessage("Tag name is required"),
];
