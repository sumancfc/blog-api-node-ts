import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import expressJWT from "express-jwt";
import asyncHandler from "express-async-handler";
import User from "../models/userModel";

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
};

const MESSAGES = {
  USER_EXISTS: "User already present",
  SIGNUP_SUCCESS: "User signup successful!!!",
  INVALID_USER: "Invalid User",
  USER_NOT_EXIST: "User with that email does not exist.",
  INCORRECT_CREDENTIALS: "Email and Password do not match.",
  SIGNIN_SUCCESS: "User signin successful!!!",
  SIGNOUT_SUCCESS: "User signout Successful!!!",
  UNAUTHORIZED: "Unauthorized. No user ID found in the request.",
  USER_NOT_FOUND: "User not found",
  ADMIN_ONLY: "Access denied. Admin resource only.",
};

// Signup controller
export const signup = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email }).exec();
    if (userExists) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ error: MESSAGES.USER_EXISTS });
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
      res
        .status(HTTP_STATUS.CREATED)
        .json({ message: MESSAGES.SIGNUP_SUCCESS });
    } else {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: MESSAGES.INVALID_USER });
    }
  }
);

// Signin controller
export const signin = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("+hashed_password +salt")
      .exec();

    if (!user) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: MESSAGES.USER_NOT_EXIST });
      return;
    }

    if (!user.authenticate(password)) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: MESSAGES.INCORRECT_CREDENTIALS });
      return;
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 86400000),
    });

    res.json({ token, message: MESSAGES.SIGNIN_SUCCESS });
  }
);

// Signout controller
export const signout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    res.clearCookie("token");
    res.status(HTTP_STATUS.OK).json({ message: MESSAGES.SIGNOUT_SUCCESS });
  }
);

// Require signin middleware
export const requireSignin = expressJWT({
  secret: process.env.JWT_SECRET as string,
  algorithms: ["HS256"],
  getToken: (req: Request) => req.cookies.token,
});

// Auth middleware
export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const authUserId = req.user?._id;

    if (!authUserId) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: MESSAGES.UNAUTHORIZED });
      return;
    }

    const user = await User.findById(authUserId);
    if (!user) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: MESSAGES.USER_NOT_FOUND });
      return;
    }

    req.profile = user;
    next();
  }
);

// Admin Middleware
export const adminMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const adminUserId = req.user?._id;

    if (!adminUserId) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: MESSAGES.UNAUTHORIZED });
      return;
    }

    const user = await User.findById(adminUserId);
    if (!user) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: MESSAGES.USER_NOT_FOUND });
      return;
    }

    if (user.role !== "admin") {
      res.status(HTTP_STATUS.FORBIDDEN).json({ error: MESSAGES.ADMIN_ONLY });
      return;
    }

    req.profile = user;
    next();
  }
);

// Role-based authorization middleware
export const authorizeRoles = (...roles: string[]) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const userId = req.user?._id;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ error: MESSAGES.UNAUTHORIZED });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ error: MESSAGES.USER_NOT_FOUND });
        return;
      }

      if (!roles.includes(user.role)) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          error: `Access denied. Allowed roles: ${roles.join(", ")}.`,
        });
        return;
      }

      req.profile = user;
      next();
    }
  );
};
