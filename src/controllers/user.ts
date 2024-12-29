import { Request, Response, NextFunction } from "express";
import User, { UserRole } from "../models/userModel";
import _ from "lodash";
import formidable from "formidable";
import fs from "fs";
import { errorHandler } from "../middlewares/dbErrorHandler";
import asyncHandler from "express-async-handler";

// Admin: Get all users
export const getAllUsers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

// Admin: Update user role
export const updateUserRole = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { _id, role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    try {
      const user = await User.findByIdAndUpdate(_id, { role }, { new: true });
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: "Failed to update role" });
    }
  }
);

// Get User Profile
export const getProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    res.json(req.profile);
  }
);

//get user profile
// exports.userProfile = async (req, res) => {
//   try {
//     const username = req.params.username;

//     const getUser = await User.findOne({ username }).exec();

//     if (!getUser) res.status(400).json({ message: "User not found" });

//     let user = getUser;

//     const blog = await Blog.find({ postedBy: user._id })
//       .populate("categories", "_id name slug")
//       .populate("tags", "_id name slug")
//       .populate("postedBy", "_id name")
//       .select(
//         "_id title slug excerpt categories tags postedBy createdAt updatedAt"
//       )
//       .exec();

//     user.photo = undefined;
//     user.hashed_password = undefined;
//     user.salt = undefined;

//     res.status(200).json({ user, blogs: blog });
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ message: errorHandler(err) });
//   }
// };

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
