const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");
const asyncHandler = require("express-async-handler");

//signup controller
exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  //check user already exist
  const userExists = await User.findOne({ email }).exec();

  if (userExists) res.status(400).json({ error: "User already present" });

  const username = email.split("@")[0];
  const profile = `${process.env.CLIENT_URL}/profile/${username}`;

  const user = await new User({
    name,
    email,
    password,
    username,
    profile,
  }).save();

  if (user) res.status(201).json({ message: "User signup successful." });
  else res.status(400).json({ error: "Invalid user" });
});

//signin controller
exports.signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email }).exec();

  if (!user)
    res.status(400).json({ error: "User with that email does not exist." });

  //check authenticate
  if (!user.authenticate(password))
    res.status(400).json({ error: "Email and Password do not match." });

  //generate token
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });

  //cookies
  res.cookie("token", token, { expiresIn: "2d" });

  if (user) {
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } else res.status(401).json({ error: "Invalid email or password" });
});

//signout controller
exports.signout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Signout Success." });
};

//user require signin
exports.requireSignin = expressJWT({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

//auth middleware
exports.authMiddleware = asyncHandler(async (req, res, next) => {
  const authUserId = req.user._id;

  const user = await User.findById({ _id: authUserId });

  if (!user) res.status(400).json({ error: "User not found" });

  req.profile = user;

  next();
});

//admin middleware
exports.adminMiddleware = asyncHandler(async (req, res, next) => {
  const adminUserId = req.user._id;

  const user = await User.findById({ _id: adminUserId });

  if (!user) res.status(400).json({ error: "User not found" });

  if (user.role !== 1)
    res.status(400).json({ error: "Admin resource. Access denied." });

  req.profile = user;

  next();
});
