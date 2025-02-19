import { RequestHandler } from "express";
import { promises as fsPromises } from "fs";
import formidable, { Fields, File, Files } from "formidable";
import asyncHandler from "express-async-handler";
import { HTTP_STATUS, USER_MESSAGES } from "../../utils/statusMessage.util";
import { User } from "../../models/user.model";
import { encodeEmailForURL, sendErrorResponse, sendEmail } from "../../utils";
import {
    CreateUserRequest,
    Gender,
    IUser,
    UserRole,
} from "../../interfaces/user.interface";
import { verifyEmailMessage } from "../../utils/emailMessage.util";
import { Relationship } from "../../models/relationship.model";

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

    const user: IUser | null = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
    );

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
    const { _id } = req.user as IUser;

    if (!_id) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.UNAUTHORIZED,
            USER_MESSAGES.UNAUTHORIZED
        );
    }

    const user: IUser | null = await User.findById(_id).exec();

    if (!user) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.NOT_FOUND,
            USER_MESSAGES.USER_NOT_FOUND
        );
    }

    res.status(200).json(user);
    // res.status(200).json({ user, blogs: blog });
});

// Update User Profile
export const updateUserProfile: RequestHandler = (req, res) => {
    const form = formidable({
        maxFileSize: 2 * 1024 * 1024, // 2MB limit for photo
        maxFiles: 1,
        keepExtensions: true,
    });

    form.parse(
        req,
        async (err: Error, fields: Fields<string>, files: Files<string>) => {
            if (err) {
                return res.status(400).json({
                    message: "Error processing form data",
                    error: err.message,
                });
            }

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
                const basicFields: string[] = [
                    "name",
                    "about",
                    "designation",
                    "phone",
                    "website",
                    "address",
                    "profession",
                    "company",
                ];
                basicFields.forEach((field: string): void => {
                    if (fields[field]) {
                        // Extract the first value if it's an array
                        const value: string = Array.isArray(fields[field])
                            ? fields[field][0]
                            : fields[field];
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
                    const value: string = Array.isArray(fields.languages)
                        ? fields.languages[0]
                        : fields.languages;
                    user.languages = value
                        .split(",")
                        .map((lang: string): string => lang.trim());
                }

                // Handle photo upload
                if (files.photo && Array.isArray(files.photo)) {
                    const photoFile: File = files.photo[0]; // assuming it's a single file
                    const fileBuffer: Buffer<ArrayBufferLike> =
                        await fsPromises.readFile(photoFile.filepath); // Read file to buffer
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
                res.status(500).json({
                    message: "Server error",
                    error: (error as Error).message,
                });
            }
        }
    );
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

// Create User
export const createUser: RequestHandler = asyncHandler(async (req, res) => {
    const { name, email, password, gender, role } =
        req.body as CreateUserRequest;

    if (!name || !email || !password || !role || !gender) {
        res.json({ message: "All fields are required" });
        return;
    }

    const userExists = await User.findOne({ email }).exec();

    if (userExists) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            USER_MESSAGES.USER_EXISTS
        );
    }

    const username: string = email.split("@")[0];
    const profile = `${process.env.CLIENT_URL}/profile/${username}`;

    const user: IUser = await new User({
        name,
        email,
        password,
        username,
        profile,
        gender,
        role,
    }).save();

    // Verify email message
    const encodedEmail: string = encodeEmailForURL(email);

    const message: string = verifyEmailMessage(name, encodedEmail);

    if (user) {
        await sendEmail(email, "For Email Verification", message, res);
        res.status(HTTP_STATUS.CREATED).json({
            message: USER_MESSAGES.USER_CREATED,
        });
    } else {
        sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            USER_MESSAGES.INVALID_USER
        );
    }
});

// Get User Profile by username
export const getUserProfile: RequestHandler = asyncHandler(async (req, res) => {
    const username: string = req.params.username;

    if (!username) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            "Username is required."
        );
    }

    const user: IUser | null = await User.findOne({ username }).exec();

    if (!user) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.NOT_FOUND,
            USER_MESSAGES.USER_NOT_FOUND
        );
    }

    res.status(200).json({ user });
});

// Delete User Profile
export const deleteUserProfile: RequestHandler = asyncHandler(
    async (req, res) => {
        const username: string = req.params.username;

        if (!username) {
            return sendErrorResponse(
                res,
                HTTP_STATUS.BAD_REQUEST,
                USER_MESSAGES.USERNAME_REQUIRED
            );
        }

        const user: IUser | null = await User.findOne({ username }).exec();

        if (!user) {
            return sendErrorResponse(
                res,
                HTTP_STATUS.NOT_FOUND,
                USER_MESSAGES.USER_NOT_FOUND
            );
        }

        await User.deleteOne({ username }).exec();

        res.status(200).json({
            message: `User with username '${username}' has been successfully deleted.`,
        });
    }
);

// Follow User
export const userToFollow: RequestHandler = asyncHandler(
    async (req, res): Promise<void> => {
        const userIdToFollow: string = req.params.userId;

        if (!userIdToFollow) {
            res.status(400).json({ message: "User Id not found." });
            return;
        }

        if (!req.user) {
            sendErrorResponse(
                res,
                HTTP_STATUS.UNAUTHORIZED,
                USER_MESSAGES.UNAUTHORIZED
            );
            return;
        }

        try {
            const { _id } = req.user as IUser;

            // Prevent following oneself
            if (_id.toString() === userIdToFollow) {
                res.status(400).json({ message: "You cannot follow yourself." });
                return;
            }

            const userToFollow = await User.findById(userIdToFollow);

            if (!userToFollow) {
                sendErrorResponse(
                    res,
                    HTTP_STATUS.NOT_FOUND,
                    USER_MESSAGES.USER_NOT_FOUND
                );
                return;
            }

            // Check if the current user is already following
            const isAlreadyFollowing = await Relationship.findOne({
                userId: _id,
                relatedUserId: userIdToFollow,
                relationshipType: "following",
            });

            if (isAlreadyFollowing) {
                res.status(409).json({ message: "User Already Followed." });
                return;
            }

            // Create "following" relationship
            const followingRelationship = new Relationship({
                userId: _id,
                relatedUserId: userIdToFollow,
                relationshipType: "following",
            });
            await followingRelationship.save();

            // Update the current user's "following" array and count
            await User.findByIdAndUpdate(
                _id,
                {
                    $push: { following: userIdToFollow },
                    $inc: { followingCount: 1 }
                },
                { new: true }
            );

            // Update the user being followed "followers" array and count
            await User.findByIdAndUpdate(
                userIdToFollow,
                {
                    $push: { followers: _id },
                    $inc: { followersCount: 1 }
                },
                { new: true }
            );

            res.status(200).json({
                message: `You successfully followed user '${userToFollow.username}'.`,
            });
        } catch (error) {
            console.error('Error in userToFollow:', error);
            sendErrorResponse(
                res,
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                'An error occurred while processing your request.'
            );
        }
    }
);

// Follow Back User
export const followBack: RequestHandler = asyncHandler(
    async (req, res): Promise<void> => {
        const userIdToFollowBack: string = req.params.userId;

        if (!req.user) {
            sendErrorResponse(
                res,
                HTTP_STATUS.UNAUTHORIZED,
                USER_MESSAGES.UNAUTHORIZED
            );
            return;
        }

        try {
            const { _id } = req.user as IUser;

            // Prevent following oneself
            if (_id.toString() === userIdToFollowBack) {
                res.status(400).json({ message: "You cannot follow yourself." });
                return;
            }

            // Check if the other user is already following the current user
            const isFollowedBy = await Relationship.findOne({
                userId: userIdToFollowBack,
                relatedUserId: _id,
                relationshipType: "following",
            });

            if (!isFollowedBy) {
                res.status(400).json({ message: "This user is not following you." });
                return;
            }

            // Check if already following back
            const alreadyFollowingBack = await Relationship.findOne({
                userId: _id,
                relatedUserId: userIdToFollowBack,
                relationshipType: "following",
            });

            if (alreadyFollowingBack) {
                res.status(409).json({ message: "You are already following this user." });
                return;
            }

            // Create new following relationship
            const newFollowing = new Relationship({
                userId: _id,
                relatedUserId: userIdToFollowBack,
                relationshipType: "following",
            });
            await newFollowing.save();

            // Update current user's following array and count
            await User.findByIdAndUpdate(
                _id,
                {
                    $push: { following: userIdToFollowBack },
                    $inc: { followingCount: 1 }
                },
                { new: true }
            );

            // Update other user's followers array and count
            await User.findByIdAndUpdate(
                userIdToFollowBack,
                {
                    $push: { followers: _id },
                    $inc: { followersCount: 1 }
                },
                { new: true }
            );

            res.status(200).json({ message: "Successfully followed back." });
        } catch (error) {
            console.error('Error in followBack:', error);
            sendErrorResponse(
                res,
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                'An error occurred while processing your request.'
            );
        }
    }
);

// Unfollow
export const unfollowUser: RequestHandler = asyncHandler(
    async (req, res): Promise<void> => {
        const userIdToUnfollow: string = req.params.userId;

        if (!req.user) {
            sendErrorResponse(
                res,
                HTTP_STATUS.UNAUTHORIZED,
                USER_MESSAGES.UNAUTHORIZED
            );
            return;
        }

        try {
            const { _id } = req.user as IUser;

            // Prevent unfollowing oneself
            if (_id.toString() === userIdToUnfollow) {
                res.status(400).json({ message: "You cannot unfollow yourself." });
                return;
            }

            // Find and remove the following relationship
            const deletedRelationship = await Relationship.findOneAndDelete({
                userId: _id,
                relatedUserId: userIdToUnfollow,
                relationshipType: "following",
            });

            if (!deletedRelationship) {
                res.status(404).json({ message: "You are not following this user." });
                return;
            }

            // Remove from current user's following array and decrement following count
            await User.findByIdAndUpdate(
                _id,
                {
                    $pull: { following: userIdToUnfollow },
                    $inc: { followingCount: -1 }
                }
            );

            // Remove from other user's followers array and decrement followers count
            await User.findByIdAndUpdate(
                userIdToUnfollow,
                {
                    $pull: { followers: _id },
                    $inc: { followersCount: -1 }
                }
            );

            res.status(200).json({ message: "Successfully unfollowed user." });
        } catch (error) {
            console.error('Error in unfollowUser:', error);
            sendErrorResponse(
                res,
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                'An error occurred while processing your request.'
            );
        }
    }
);
