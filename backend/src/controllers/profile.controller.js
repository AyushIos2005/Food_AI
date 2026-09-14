const profileModel = require("../models/profile.model");
const userModel = require("../models/user.model");
const logger = require("../utils/logger");

function getAuthUserId(req) {
    return req.userId || req.auth?.id;
}

async function createProfile(req, res) {
    const userId = getAuthUserId(req);
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: Token not found" });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const alreadyProfileExist = await profileModel.findOne({ user: userId }).lean();
        if (alreadyProfileExist) {
            return res.status(409).json({
                message: "Profile already exists, use update instead"
            });
        }

        const {
            fullName,
            contactNumber,
            dateOfBirth,
            SocialMedia,
            profession,
            hobbies,
            bio
        } = req.body;

        if (!fullName) {
            return res.status(400).json({
                message: "fullName is required"
            });
        }

        const profile = await profileModel.create({
            user: userId,
            fullName,
            contactNumber,
            dateOfBirth,
            SocialMedia,
            profession,
            hobbies,
            bio
        });

        return res.status(201).json({
            message: "Profile created successfully",
            profile
        });
    } catch (err) {
        logger.error("Create Profile Error", err);
        return res.status(500).json({
            message: "Error creating profile"
        });
    }
}

async function updateProfile(req, res) {
    const userId = getAuthUserId(req);
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: Token not found" });
    }

    const profileId = req.params.id;

    try {
        const profile = await profileModel.findById(profileId);
        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        if (profile.user.toString() !== String(userId)) {
            return res.status(403).json({
                message: "You are not allowed to update this profile"
            });
        }

        const {
            fullName,
            contactNumber,
            dateOfBirth,
            SocialMedia,
            profession,
            hobbies,
            bio
        } = req.body;

        if (fullName !== undefined) profile.fullName = fullName;
        if (contactNumber !== undefined) profile.contactNumber = contactNumber;
        if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth;
        if (SocialMedia !== undefined) profile.SocialMedia = SocialMedia;
        if (profession !== undefined) profile.profession = profession;
        if (hobbies !== undefined) profile.hobbies = hobbies;
        if (bio !== undefined) profile.bio = bio;

        await profile.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            profile
        });
    } catch (err) {
        logger.error("Update Profile Error", err);
        return res.status(500).json({
            message: "Error updating profile"
        });
    }
}

async function deleteProfile(req, res) {
    const userId = getAuthUserId(req);
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: Token not found" });
    }

    const profileId = req.params.id;

    try {
        const profile = await profileModel.findById(profileId);
        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        if (profile.user.toString() !== String(userId)) {
            return res.status(403).json({
                message: "You are not allowed to delete this profile"
            });
        }

        await profileModel.findByIdAndDelete(profileId);

        return res.status(200).json({
            message: "Profile deleted successfully"
        });
    } catch (err) {
        logger.error("Delete Profile Error", err);
        return res.status(500).json({
            message: "Error deleting profile"
        });
    }
}

async function getProfile(req, res) {
    const userId = getAuthUserId(req);
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: Token not found" });
    }

    try {
        const profile = await profileModel
            .findOne({ user: userId })
            .populate("user", "-password")
            .lean();

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        return res.status(200).json({
            message: "Profile fetched successfully",
            profile
        });
    } catch (err) {
        logger.error("Get Profile Error", err);
        return res.status(500).json({
            message: "Error fetching profile"
        });
    }
}

module.exports = {
    createProfile,
    updateProfile,
    deleteProfile,
    getProfile
};
