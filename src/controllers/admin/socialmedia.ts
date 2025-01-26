import { NextFunction, Request, Response } from "express";
import { SocialMedia } from "../../models/socialMedia.model";
import { ISocialMedia } from "../../interfaces";

// Create Social Media ---> Admin
export const createSocialMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, link, icon } = req.body as ISocialMedia;

        const socialMedia = new SocialMedia({ name, link, icon });

        await socialMedia.save();

        res.status(201).json({
            message: "Social media created successfully.",
            socialMedia,
        });
    } catch (error) {
        next(error);
    }
};

// Get All Social Media
export const getAllSocialMedias = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const socials = await SocialMedia.find({});

        res.status(200).json(socials);
    } catch (error) {
        next(error);
    }
};

// Get Social Media by ID
export const getSocialMediaByID = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const socialMedia: ISocialMedia | null = await SocialMedia.findById(id);

        res.status(200).json(socialMedia);
    } catch (error) {
        next(error);
    }
};

// Update Social Media ---> Admin
export const updateSocialMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const { name, link, icon } = req.body;

        const socialMedia = await SocialMedia.findById(id);

        if (!socialMedia) {
            res.status(404).json({ message: "Social media not found." });
        }

        // Prepare update object (only include fields provided in the request)
        const updateData: Partial<ISocialMedia> = {};
        if (name) updateData.name = name;
        if (link) updateData.link = link;
        if (icon) updateData.icon = icon;

        const updatedSocialMedia = await SocialMedia.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (updatedSocialMedia) {
            res.status(200).json({
                message: "Social media updated successfully",
                updatedSocialMedia,
            });
        } else {
            res.status(400).json({ message: "Failed to update social media." });
        }
    } catch (error) {
        next(error);
    }
};

// Delete Social Media
export const deleteSocialMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        await SocialMedia.findByIdAndDelete(id);

        res.status(200).json({
            message: "Social media deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};
