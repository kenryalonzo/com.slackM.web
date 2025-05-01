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
    res.send("Login Route");
}

export function logout(req, res) {
    res.send("Logout Route");
}