import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import expressJWT from "express-jwt";
import asyncHandler from "express-async-handler";
import { User, IUser } from "../models/userModel";
import {
  SignupRequest,
  SigninRequest,
  HTTP_STATUS,
  USER_MESSAGES,
} from "../utils";
import { sendErrorResponse } from "../helpers";

// Signup controller
export const signup: RequestHandler = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body as SignupRequest;

  const userExists = await User.findOne({ email }).exec();
  if (userExists) {
    return sendErrorResponse(
      res,
      HTTP_STATUS.BAD_REQUEST,
      USER_MESSAGES.USER_EXISTS
    );
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

  user
    ? res
        .status(HTTP_STATUS.CREATED)
        .json({ message: USER_MESSAGES.SIGNUP_SUCCESS })
    : sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        USER_MESSAGES.INVALID_USER
      );
});

// Signin controller
export const signin: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body as SigninRequest;

  const user = await User.findOne({ email })
    .select("+hashed_password +salt")
    .exec();

  if (!user) {
    return sendErrorResponse(
      res,
      HTTP_STATUS.BAD_REQUEST,
      USER_MESSAGES.USER_NOT_EXIST
    );
  }

  if (!user.authenticate(password)) {
    return sendErrorResponse(
      res,
      HTTP_STATUS.BAD_REQUEST,
      USER_MESSAGES.INCORRECT_CREDENTIALS
    );
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 86400000),
  });

  res.json({ token, message: USER_MESSAGES.SIGNIN_SUCCESS });
});

// Signout controller
export const signout: RequestHandler = asyncHandler(async (_, res) => {
  res.clearCookie("token");
  res.status(HTTP_STATUS.OK).json({ message: USER_MESSAGES.SIGNOUT_SUCCESS });
});

// Require signin middleware
export const requireSignin = expressJWT({
  secret: process.env.JWT_SECRET as string,
  algorithms: ["HS256"],
  getToken: (req: Request) => req.cookies.token,
});

// Auth middleware
export const authMiddleware: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const user = req.user as IUser;

    if (!user?._id) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        USER_MESSAGES.UNAUTHORIZED
      );
    }

    const foundUser = await User.findById(user._id);
    if (!foundUser) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        USER_MESSAGES.USER_NOT_FOUND
      );
    }

    req.profile = foundUser;
    next();
  }
);

// Admin Middleware
export const adminMiddleware: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const user = req.user as IUser | undefined;

    if (!user?._id) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        USER_MESSAGES.UNAUTHORIZED
      );
    }

    const foundUser = await User.findById(user._id);
    if (!foundUser) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        USER_MESSAGES.USER_NOT_FOUND
      );
    }

    if (foundUser.role !== "admin") {
      return sendErrorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        USER_MESSAGES.ADMIN_ONLY
      );
    }

    req.profile = foundUser;
    next();
  }
);

// Role-based authorization middleware
export const authorizeRoles = (...roles: string[]): RequestHandler => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user as IUser;

    if (!user?._id) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        USER_MESSAGES.UNAUTHORIZED
      );
    }

    const foundUser = await User.findById(user._id);
    if (!foundUser) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        USER_MESSAGES.USER_NOT_FOUND
      );
    }

    if (!roles.includes(foundUser.role)) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        `Access denied. Allowed roles: ${roles.join(", ")}.`
      );
    }

    req.profile = foundUser;
    next();
  });
};
