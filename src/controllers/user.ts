import { RequestHandler } from "express";
import _ from "lodash";
import { promises as fsPromises } from 'fs';
import formidable, { Fields, Files } from "formidable";
import asyncHandler from "express-async-handler";
import { HTTP_STATUS, USER_MESSAGES } from "../utils/status_message";
import { User } from "../models/userModel";
import { sendErrorResponse } from "../helpers";
import { IUser, UserRole } from "../interfaces/user";
import IncomingForm from "formidable/Formidable";

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

// Utility function to handle formidable parsing
const parseForm = async (req: any): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
    const form = formidable({
        multiples: false,
        maxFileSize: 2 * 1024 * 1024, // 2MB limit for photo
    });
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({ fields, files });
        });
    });
};

export const updateUserProfile: RequestHandler = (req, res) => {
    const form = formidable({
        multiples: true,
        maxFileSize: 2 * 1024 * 1024, // 2MB limit for photo
    });

    form.parse(req, async (err, fields, files) => {
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
            const basicFields = ["name", "about", "designation", "phone", "website", "address", "profession", "company"];
            basicFields.forEach((field) => {
                if (fields[field]) {
                    // Extract the first value if it's an array
                    const value = Array.isArray(fields[field]) ? fields[field][0] : fields[field];
                    (user as any)[field] = value;
                }
            });

            // Update languages
            if (fields.languages) {
                const value = Array.isArray(fields.languages) ? fields.languages[0] : fields.languages;
                user.languages = value.split(",").map((lang) => lang.trim());
            }

            // Handle photo upload
            if (files.photo && Array.isArray(files.photo)) {
                const photoFile = files.photo[0];  // assuming it's a single file
                const fileBuffer = await fsPromises.readFile(photoFile.filepath); // Read file to buffer
                user.photo = {
                    data: fileBuffer,
                    contentType: photoFile.mimetype || "image/jpeg", // Default to 'image/jpeg' if mimetype is not available
                };
            }

            await user.save();

            // Prepare user object for response
            const userToReturn = user.toObject();

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

/***


export const updateUserProfile: RequestHandler = (req, res) => {
    const form = formidable({
        multiples: true,
        maxFileSize: 2* 1024 * 1024 // 1MB limit for photo
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                message: "Form parsing error",
                error: err.message
            });
        }


            const user = req.profile as IUser;

            // Fields that are allowed to be updated
            const updatableFields = [
                'name', 'email', 'about', 'designation', 'phone', 'website', 'address',
                'dateOfBirth', 'gender', 'languages', 'profession', 'company'
            ];

            // Update fields
            updatableFields.forEach(field => {
                if (field in fields) {
                    user[field] = fields[field];
                }
            });

            // Update nested fields
            if (fields.socialMedia) {
                const socialMedia = JSON.parse(fields.socialMedia as string);
                user.socialMedia = { ...user.socialMedia, ...socialMedia };
            }

            if (fields.preferences) {
                const preferences = JSON.parse(fields.preferences as string);
                user.preferences = { ...user.preferences, ...preferences };
            }

            if (fields.emergencyContact) {
                const emergencyContact = JSON.parse(fields.emergencyContact as string);
                user.emergencyContact = { ...user.emergencyContact, ...emergencyContact };
            }

            // Handle photo upload
            if (files.photo && 'filepath' in files.photo) {
                const photo = files.photo;
                if (photo.size > 2 * 1024 * 1024) { // 1MB limit
                    return res.status(400).json({
                        message: "Photo size should be less than 1MB"
                    });
                }
                user.photo = {
                    data: fs.readFileSync(photo.filepath),
                    contentType: photo.mimetype || ''
                };
            }

            // Save the updated user
            await user.save();

            // Prepare user object for response
            const userToReturn = user.toObject();
            delete userToReturn.hashed_password;
            delete userToReturn.salt;
            delete userToReturn.photo;

            res.json({
                message: "Profile updated successfully",
                user: userToReturn
            });

    });
};

*/


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
