const { check } = require("express-validator");

exports.tagValidation = [
  check("name").not().isEmpty().withMessage("Tag name is required"),
];
