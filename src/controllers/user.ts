import { RequestHandler } from "express";
import _ from "lodash";
import { promises as fsPromises } from 'fs';
import formidable, { Fields, File, Files } from "formidable";
import asyncHandler from "express-async-handler";
import { HTTP_STATUS, USER_MESSAGES } from "../utils/status_message";
import { User } from "../models/userModel";
import { sendErrorResponse } from "../helpers";
import { Gender, IUser, UserRole } from "../interfaces/user";

// Admin: Get all users
export const getAllUsers: RequestHandler = asyncHandler(async (_, res) => {
    const users: IUser[] = await User.find();
    res.status(200).json(users);
});

// Admin: Update user role
export const updateUserRole: RequestHandler = asyncHandler(async (req, res) => {
    const userId: string = req.params.id;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, "Invalid Role");
    }

    const user: IUser | null = await User.findByIdAndUpdate(userId, { role }, { new: true });

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
    const username: string = req.params.username;

    const user: IUser | null = await User.findOne({ username }).exec();

    if (!user?._id) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.NOT_FOUND,
            USER_MESSAGES.USER_NOT_FOUND
        );
    }

    res.status(200).json({ user });
    // res.status(200).json({ user, blogs: blog });
});

export const updateUserProfile: RequestHandler = (req, res) => {
    const form = formidable({
        multiples: true,
        maxFileSize: 2 * 1024 * 1024, // 2MB limit for photo
        maxFiles: 1,
        keepExtensions: true,

    });

    form.parse(req, async (err: Error, fields: Fields<string>, files: Files<string>) => {
        if (err) {
            return res.status(400).json({ message: "Error processing form data", error: err.message });
        }
        // Log fields and files
        console.log("Parsed Fields:", fields);
        console.log("Parsed Files:", files);
        try {
            const getUser = req.user as IUser;
            if (!getUser?._id) {
                return sendErrorResponse(
                    res,
                    HTTP_STATUS.UNAUTHORIZED,
                    "Unauthorized access"
                );
            }

            const user = await User.findById(getUser._id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Update basic fields
            const basicFields: string[] = ["name", "about", "designation", "phone", "website", "address", "profession", "company"];
            basicFields.forEach((field: string): void => {
                if (fields[field]) {
                    // Extract the first value if it's an array
                    const value: string = Array.isArray(fields[field]) ? fields[field][0] : fields[field];
                    (user as any)[field] = value;
                }
            });

            // Update gender
            if (fields.gender) {
                const gender: string = Array.isArray(fields.gender)
                    ? fields.gender[0]
                    : fields.gender;

                if (Object.values(Gender).includes(gender as Gender)) {
                    user.gender = gender as Gender;
                } else {
                    return res.status(400).json({
                        message: "Invalid gender value.",
                    });
                }
            }

            // Update languages
            if (fields.languages) {
                const value: string = Array.isArray(fields.languages) ? fields.languages[0] : fields.languages;
                user.languages = value.split(",").map((lang:string):string => lang.trim());
            }

            // Handle photo upload
            if (files.photo && Array.isArray(files.photo)) {
                const photoFile: File = files.photo[0];  // assuming it's a single file
                const fileBuffer = await fsPromises.readFile(photoFile.filepath); // Read file to buffer
                user.photo = {
                    data: fileBuffer,
                    contentType: photoFile.mimetype || "image/jpeg", // Default to 'image/jpeg' if mimetype is not available
                };
            }

            await user.save();

            // Prepare user object for response
            const userToReturn = user.toObject();
            delete userToReturn.photo;

            res.status(200).json({
                message: "Profile updated successfully",
                user: userToReturn,
            });
        } catch (error) {
            console.error("Error updating user profile:", error);
            res.status(500).json({ message: "Server error", error: (error as Error).message });
        }
    });
};

// Get User Photo
export const getUserPhoto: RequestHandler = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).exec();

        if (!user) {
            return sendErrorResponse(
                res,
                HTTP_STATUS.NOT_FOUND,
                USER_MESSAGES.USER_NOT_FOUND
            );
        }

        if (user.photo && user.photo.data) {
            const contentType: string = user.photo.contentType.toString();

            console.log("User Photo Content Type:", contentType);
            res.set("Content-Type", contentType);
             res.send(user.photo.data);
        } else {
             res.status(404).json({ error: "User photo not found" });
        }
    } catch (error) {
        console.error("Error fetching user photo:", error);
        res.status(500).json({ error: "Server error" });
    }
};