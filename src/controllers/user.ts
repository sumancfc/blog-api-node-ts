import { RequestHandler } from "express";
import _ from "lodash";
import asyncHandler from "express-async-handler";
//import formidable from "formidable";
//import fs from "fs";
import { HTTP_STATUS, USER_MESSAGES } from "../utils/status_message";
import { User } from "../models/userModel";
import { sendErrorResponse } from "../helpers";
import { IUser, UserRole } from "../interfaces";

// Admin: Get all users
export const getAllUsers: RequestHandler = asyncHandler(async (_, res) => {
  const users: IUser[] = await User.find();
  res.status(200).json(users);
});

// Admin: Update user role
export const updateUserRole: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!Object.values(UserRole).includes(role)) {
    return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, "Invalid Role");
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

  if (!user) {
    return sendErrorResponse(
      res,
      HTTP_STATUS.NOT_FOUND,
      USER_MESSAGES.USER_NOT_FOUND
    );
  }
  res.status(200).json(user);
});

// Get User Profile
export const getProfile: RequestHandler = asyncHandler(async (req, res) => {
  res.json(req.profile);
});

//get user profile
export const userProfile: RequestHandler = asyncHandler(async (req, res) => {
  const username = req.params.username;

  const user: IUser | null = await User.findOne({ username }).exec();

  if (!user) {
    return sendErrorResponse(
      res,
      HTTP_STATUS.NOT_FOUND,
      USER_MESSAGES.USER_NOT_FOUND
    );
  }

  res.status(200).json({ user });
  // res.status(200).json({ user, blogs: blog });
});

//update user profile
// exports.updateUserProfile = (req, res) => {
//   let form = new formidable.IncomingForm();
//   form.keepExtension = true;
//   form.parse(req, (err, fields, files) => {
//     if (err)
//       res.status(400).json({
//         message: "Photo could not be uploaded",
//       });

//     let user = req.profile;
//     user = _.extend(user, fields);

//     if (fields.password && fields.password.length < 6) {
//       return res.status(400).json({
//         message: "Password should be min 6 characters long",
//       });
//     }

//     if (files.photo) {
//       if (files.photo.size > 10000000) {
//         return res.status(400).json({
//           message: "Image should be less than 1mb",
//         });
//       }
//       user.photo.data = fs.readFileSync(files.photo.path);
//       user.photo.contentType = files.photo.type;
//     }

//     user.save((err, result) => {
//       if (err) {
//         return res.status(400).json({
//           error: "All filds required",
//         });
//       }
//       user.hashed_password = undefined;
//       user.salt = undefined;
//       user.photo = undefined;
//       res.json(user);
//     });
//   });
// };

//get user photo
// exports.getUserPhoto = async (req, res) => {
//   try {
//     const username = req.params.username;

//     const user = await User.findOne({ username }).exec();

//     if (!user)
//       res.status(400).json({
//         message: "User not found",
//       });

//     if (user.photo.data) {
//       res.set("Content-Type", user.photo.contentType);
//       return res.send(user.photo.data);
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(400).json({
//       message: "User not found",
//     });
//   }
// };
