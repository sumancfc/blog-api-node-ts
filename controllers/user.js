const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

//get user profile
exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  return res.json(req.profile);
};
