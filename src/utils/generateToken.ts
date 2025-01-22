import jwt from "jsonwebtoken";
import { IUser} from "../interfaces/user";
import { Response} from "express";

export const generateToken = (user: IUser, expiresIn: string): string => {
    const token: string = jwt.sign(
        { _id: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn }
    );

    return token;
};

export const setTokenInCookie = (res: Response, token: string, cookieMaxAge: number) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(Date.now() + cookieMaxAge),
    });
};