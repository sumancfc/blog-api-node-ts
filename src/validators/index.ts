import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const runValidation = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({ message: errors.array()[0].msg });
        return;
    }

    next();
};
