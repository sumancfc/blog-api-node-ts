const { check } = require("express-validator");

exports.categoryValidation = [
  check("name").not().isEmpty().withMessage("Category name is required"),
];
