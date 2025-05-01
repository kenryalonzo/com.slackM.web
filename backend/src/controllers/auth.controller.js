import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
    const { fulName, email, password } = req.body;


    try {
        if (!fulName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists, please use a different email" });
        }

        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fulName,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: "User created successfully",
            user: {
                // id: newUser._id,
                fulName: newUser.fulName,
                email: newUser.email,
                password: newUser.password,
                profilePicture: randomAvatar,
            },
            token,
        });

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        res.status(201).json({success: true, message: "User created successfully", user: newUser 

        });
    } catch (error) {
        console.log("Error during signup controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function login(req, res) {
     try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isPasswordCorrect = await user.matchPassword(password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({ success: true, user});

    } catch (error) {
        
        console.log("Error during login controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export function logout(req, res) {
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
}

export async function onboard(req, res) {

    try {
        const userId = req.user._id;

        const { fulName, bio, nativeLanguage, learningLanguage, location } = req.body;
        if (!fulName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({ 
                message: "All fields are required",
                missingFields: [
                    !fulName && "fulName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ].filter(Boolean),
            });
        }

        const updateUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarding: true,
        }, { new: true });

        if (!updateUser) {
            return res.status(404).json({ message: "User not found" });
        }

        try {
            await upsertStreamUser(updateUser._id, {
                name: updateUser.fulName,
                email: updateUser.email,
                image: updateUser.profilePicture,
            });
            console.log(`Stream user updated successfully after onboarding: ${updateUser.fulName}`);
        } catch (streamError) {
            console.error("Error updating Stream user:", streamError.message);
            return res.status(500).json({ message: "Failed to update Stream user" });
        }
        
        res.status(200).json({ success: true, user: updateUser });
        // You can add further onboarding logic here if needed
    } catch (error) {
        console.log("Error during onboarding controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}