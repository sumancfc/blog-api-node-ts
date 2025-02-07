import { Request, RequestHandler } from "express";
import expressJWT from "express-jwt";
import asyncHandler from "express-async-handler";
import { User } from "../models/user.model";
import { HTTP_STATUS, USER_MESSAGES } from "../utils/statusMessage.util";
import {
    IUser,
    SignUpRequest,
    SignInRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    AccountStatus,
} from "../interfaces/user.interface";
import {
    getExpirySettings,
    sendEmail,
    sendErrorResponse,
    generateAlphanumericCode,
} from "../utils";
import {
    confirmEmailMessage,
    passwordResetMessage,
    verifyEmailMessage,
    passwordResetConfirmMessage,
} from "../utils/emailMessage.util";
import { generateToken, setTokenInCookie } from "../utils/generateToken.util";
import logger from "../configs/logger";

// Signup controller
export const signUp: RequestHandler = asyncHandler(async (req, res) => {
    const { name, email, password, agreedToTerms } = req.body as SignUpRequest;

    logger.info(`Sign up requested for email: ${email}`);

    const userExists = await User.findOne({ email }).exec();
    if (userExists) {
        logger.warn(`User already exists with email: ${email}`);
        return sendErrorResponse(
            res,
            HTTP_STATUS.CONFLICT,
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
        agreedToTerms,
    }).save();

    const message: string = verifyEmailMessage(name, username);

    if (user) {
        logger.info(`User created with email: ${email}`);
        await sendEmail(email, "For Email Verification", message, res);
        res.status(HTTP_STATUS.CREATED).json({
            message: USER_MESSAGES.SIGNUP_SUCCESS,
        });
    } else {
        logger.error(`Failed to create user with email: ${email}`);
        sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            USER_MESSAGES.INVALID_USER
        );
    }
});

// Sign In controller
export const signIn: RequestHandler = asyncHandler(async (req, res) => {
    const { email, password, keepMeLoggedIn } = req.body as SignInRequest & {
        keepMeLoggedIn?: boolean;
    };

    logger.info(`Sign in requested for email: ${email}`);

    const user = await User.findOne({ email })
        .select("+hashed_password +salt")
        .exec();

    console.log("User from database :", user);

    if (!user) {
        logger.warn(`User not found with email: ${email}`);
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            USER_MESSAGES.USER_NOT_EXIST
        );
    }

    if (!user.authenticate(password)) {
        logger.warn(`Incorrect credentials for email: ${email}`);
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            USER_MESSAGES.INCORRECT_CREDENTIALS
        );
    }

    if (!user.is_verified) {
        logger.warn(`Email not verified for email: ${email}`);
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            USER_MESSAGES.EMAIL_VERIFY
        );
    }

    const { expiresIn, cookieMaxAge } = getExpirySettings(keepMeLoggedIn);
    const token: string = generateToken(user, expiresIn);

    setTokenInCookie(res, token, cookieMaxAge);

    // Update lastLogin in the database
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User signed in with email: ${email}`);

    const userData = {
        role: user.role,
        name: user.name,
        email: user.email,
        username: user.username,
        profile: user.profile,
        lastLogin: user.lastLogin,
    };

    res.status(200).json({
        user: userData,
        message: USER_MESSAGES.SIGNIN_SUCCESS,
    });
});

// Verify Email
export const verifyEmail: RequestHandler = asyncHandler(async (req, res) => {
    const username: string = req.params.username;

    logger.info(`Email verification requested for username: ${username}`);

    const user: IUser | null = await User.findOne({ username }).exec();

    if (!user) {
        logger.warn(`Invalid link for username: ${username}`);
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            USER_MESSAGES.INVALID_LINK
        );
    }

    if (user.is_verified) {
        logger.warn(`Email already verified for username: ${username}`);
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            USER_MESSAGES.ALREADY_VERIFIED
        );
    }

    const { _id, name, email } = user;

    await User.updateOne(
        { _id },
        { $set: { is_verified: true, accountStatus: AccountStatus.ACTIVE } }
    );

    logger.info(`Email verified for username: ${username}`);

    const message: string = confirmEmailMessage(name);

    // Send email to user
    await sendEmail(email, "Welcome", message, res);

    res.status(200).json({ message: USER_MESSAGES.EMAIL_VERIFIED });
});

// Sign Out controller
export const signOut: RequestHandler = asyncHandler(async (_, res) => {
    logger.info("User signed out");
    res.clearCookie("token");
    res.status(HTTP_STATUS.OK).json({ message: USER_MESSAGES.SIGNOUT_SUCCESS });
});

// Require Sign In middleware
export const requireSignIn: RequestHandler = expressJWT({
    secret: process.env.JWT_SECRET as string,
    algorithms: ["HS256"],
    getToken: (req: Request) => req.cookies.token,
}).unless({ path: ["/signup", "/signin"] });

// Role-based authorization middleware
export const authorizeRoles = (...roles: string[]): RequestHandler => {
    return asyncHandler(async (req, res, next) => {
        const user = req.user as IUser;

        if (!user?._id) {
            logger.warn("Unauthorized access attempt");
            return sendErrorResponse(
                res,
                HTTP_STATUS.UNAUTHORIZED,
                USER_MESSAGES.UNAUTHORIZED
            );
        }

        const foundUser = await User.findById(user._id);
        if (!foundUser) {
            logger.warn(`User not found with id: ${user._id}`);
            return sendErrorResponse(
                res,
                HTTP_STATUS.NOT_FOUND,
                USER_MESSAGES.USER_NOT_FOUND
            );
        }

        if (!roles.includes(foundUser.role)) {
            logger.warn(
                `Access denied for user with id: ${user._id}. Required roles: ${roles.join(", ")}`
            );
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

// Forgot Password
export const forgotPassword: RequestHandler = asyncHandler(async (req, res) => {
    const { email } = req.body as ForgotPasswordRequest;

    logger.info(`Password reset requested for email: ${email}`);

    if (!email) {
        logger.warn("Invalid email provided for password reset");
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            USER_MESSAGES.INVALID_EMAIL
        );
    }

    const user: IUser | null = await User.findOne({ email });

    if (!user) {
        logger.warn(`User not found with email: ${email}`);
        return sendErrorResponse(
            res,
            HTTP_STATUS.NOT_FOUND,
            USER_MESSAGES.USER_NOT_EXIST
        );
    }

    const codeLength: number = Number(process.env.CODE_LENGTH) || 6;
    const expiryTime: number = Number(process.env.EXPIRY_TIME) || 30;
    const code: string = generateAlphanumericCode(codeLength);
    const codeExpiry: Date = new Date(Date.now() + expiryTime * 60 * 1000);

    try {
        const updatedUser: IUser | null = await User.findOneAndUpdate(
            { email },
            {
                resetPassword: code,
                resetPasswordExpires: codeExpiry,
            },
            { new: true }
        );

        if (!updatedUser) {
            logger.error(
                `Failed to update user with email: ${email} for password reset`
            );
            return sendErrorResponse(
                res,
                HTTP_STATUS.BAD_REQUEST,
                USER_MESSAGES.USER_UPDATE_FAIL
            );
        }

        logger.info(`Password reset code sent to email: ${email}`);

        const message: string = passwordResetMessage(updatedUser.name, code);
        await sendEmail(email, "Code For Password Reset", message, res);

        res.status(HTTP_STATUS.OK).json({
            message: USER_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
            expiresIn: `${expiryTime} minutes`,
        });
    } catch (error) {
        logger.error(`Error during password reset for email: ${email}`, error);
        sendErrorResponse(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            USER_MESSAGES.PASSWORD_RESET_FAILED
        );
    }
});

// Reset Password
export const resetPassword: RequestHandler = asyncHandler(async (req, res) => {
    const { email, resetCode, newPassword } = req.body as ResetPasswordRequest;

    logger.info(`Reset password requested for email: ${email}`);

    try {
        const user: IUser | null = await User.findOne({
            email,
            resetPassword: resetCode,
            resetPasswordExpires: { $gt: Date.now() }, // Check if the code has expired
        });

        if (!user) {
            logger.warn(`Invalid or expired reset code for email: ${email}`);
            return sendErrorResponse(
                res,
                HTTP_STATUS.NOT_FOUND,
                USER_MESSAGES.INVALID_RESET_CODE_OR_EXPIRED
            );
        }

        user.salt = user.makeSalt();
        user.hashed_password = user.encryptPassword(newPassword);

        user.resetPassword = "";
        user.resetPasswordExpires = new Date();

        await user.save();

        logger.info(`Password reset successfully for email: ${email}`);

        const message: string = passwordResetConfirmMessage(user.name);
        await sendEmail(email, "Password Changed", message, res);

        res.status(200).json({ ok: true });
    } catch (error) {
        logger.error(`Error resetting password for email: ${email}`, error);
        sendErrorResponse(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            USER_MESSAGES.ERROR_RESETTING_PASSWORD
        );
    }
});
