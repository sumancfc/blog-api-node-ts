import { check, ValidationChain } from "express-validator";

export const userSignupValidation: ValidationChain[] = [
  check("name").not().isEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Must be a valid email address"),
  check("password")
      .not()
      .isIn(["123456", "password", "god", "abcdef"])
      .withMessage("Do not use a common word as the password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/\d/)
      .withMessage("Password must contain a digit"),
];

export const userSigninValidation: ValidationChain[] = [
  check("email").isEmail().withMessage("Must be a valid email address"),
  check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/\d/)
      .withMessage("Password must contain a number"),
];
