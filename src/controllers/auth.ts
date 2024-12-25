import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import expressJWT from "express-jwt";
import asyncHandler from "express-async-handler";

// Signup controller
export const signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email }).exec();
  if (userExists) {
    res.status(400).json({ error: "User already present" });
    return;
  }

  const username = email.split("@")[0];
  const profile = `${process.env.CLIENT_URL}/profile/${username}`;

  const user = await new User({
    name,
    email,
    password,
    username,
    profile,
  }).save();

  if (user) {
    res.status(201).json({ message: "User signup successful." });
  } else {
    res.status(400).json({ error: "Invalid user" });
  }
});

// Signin controller
export const signin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).exec();

  if (!user) {
    res.status(400).json({ error: "User with that email does not exist." });
    return;
  }

  // Check authentication
  if (!user.authenticate(password)) {
    res.status(400).json({ error: "Email and Password do not match." });
    return;
  }

  // Generate token
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });

  // Set cookies
  res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 86400000) }); // 1 day in ms

  user.hashed_password = undefined;
  user.salt = undefined;

  res.json({
    token,
    user,
  });
});

// Signout controller
export const signout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Signout Success." });
  } catch (err) {
    console.error(err);
  }
};

// Require signin middleware
export const requireSignin = expressJWT({
  secret: process.env.JWT_SECRET as string,
  algorithms: ["HS256"],
  getToken: (req: Request) => req.cookies.token,
});

// Auth middleware
export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authUserId = req.user?._id;

  const user = await User.findById(authUserId);
  if (!user) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  req.profile = user;
  next();
});

// Admin middleware
export const adminMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const adminUserId = req.user?._id;

  const user = await User.findById(adminUserId);
  if (!user) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  if (user.role !== 1) {
    res.status(400).json({ error: "Admin resource. Access denied." });
    return;
  }

  req.profile = user;
  next();
});
