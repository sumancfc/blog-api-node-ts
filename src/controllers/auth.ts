import { Request, RequestHandler } from "express";
import expressJWT from "express-jwt";
import asyncHandler from "express-async-handler";
import { User } from "../models/userModel";
import { HTTP_STATUS, USER_MESSAGES } from "../utils/status_message";
import {
    IUser,
    SignUpRequest,
    SignInRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    AccountStatus,
} from "../interfaces/user";
import {
    sendErrorResponse,
    encodeEmailForURL,
    generateAlphanumericCode,
} from "../helpers";
import { getExpirySettings, sendEmail } from "../utils";
import {
    confirmEmailMessage,
    passwordResetMessage,
    verifyEmailMessage,
    passwordResetConfirmMessage,
} from "../utils/emailMessage";
import { generateToken, setTokenInCookie } from "../utils/generateToken";

// Signup controller
export const signUp: RequestHandler = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body as SignUpRequest;

    const userExists = await User.findOne({ email }).exec();
    if (userExists) {
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
    }).save();

    // Verify email message
    const encodedEmail: string = encodeEmailForURL(email);
    const message: string = verifyEmailMessage(name, encodedEmail);

    if (user) {
        await sendEmail(email, "For Email Verification", message, res);
        res.status(HTTP_STATUS.CREATED).json({
            message: USER_MESSAGES.SIGNUP_SUCCESS,
        });
    } else {
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

    if (!user.is_verified)
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            USER_MESSAGES.EMAIL_VERIFY
        );

    const { expiresIn, cookieMaxAge } = getExpirySettings(keepMeLoggedIn);

    const token: string = generateToken(user, expiresIn);

    setTokenInCookie(res, token, cookieMaxAge);

    // Update lastLogin in the database
    user.lastLogin = new Date();
    await user.save();

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
    const id: string = req.params.id;
    const trimmedId: string = id.trim();

    const user: IUser | null = await User.findById(trimmedId).exec();

    if (!user) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            USER_MESSAGES.INVALID_LINK
        );
    }

    if (user.is_verified) {
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

    const message: string = confirmEmailMessage(name);

    // Send email to user
    await sendEmail(email, "Welcome", message, res);

    res.status(200).json({ message: USER_MESSAGES.EMAIL_VERIFIED });
});

// Sign Out controller
export const signOut: RequestHandler = asyncHandler(async (_, res) => {
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

// Is Owner or Admin
/*export const isOwnerOrAdmin: RequestHandler = (req, res, next ) => {
    const { username } = req.params;
    if (!username) return;

    const loggedInUser = req.user as IUser;

    if (loggedInUser.username === username || loggedInUser.role === "admin") {
        return next();
    }

    res.status(403).json({ message: "You are not authorized to access this resource." });
}*/

// Forgot Password
export const forgotPassword: RequestHandler = asyncHandler(async (req, res) => {
    const { email } = req.body as ForgotPasswordRequest;

    if (!email) {
        return sendErrorResponse(
            res,
            HTTP_STATUS.BAD_REQUEST,
            USER_MESSAGES.INVALID_EMAIL
        );
    }

    const user: IUser | null = await User.findOne({ email });

    if (!user) {
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
            return sendErrorResponse(
                res,
                HTTP_STATUS.BAD_REQUEST,
                USER_MESSAGES.USER_UPDATE_FAIL
            );
        }

        const message: string = passwordResetMessage(updatedUser.name, code);

        await sendEmail(email, "Code For Password Reset", message, res);

        res.status(HTTP_STATUS.OK).json({
            message: USER_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
            expiresIn: `${expiryTime} minutes`,
        });
    } catch (error) {
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

    const user: IUser | null = await User.findOne({
        email,
        resetPassword: resetCode,
        resetPasswordExpires: { $gt: Date.now() }, // Check if the code has expired
    });

    if (!user) {
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

    const message: string = passwordResetConfirmMessage(user.name);

    await sendEmail(email, "Password Changed", message, res);

    res.status(200).json({ ok: true });
});
