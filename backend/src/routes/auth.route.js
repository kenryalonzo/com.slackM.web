import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/signup", signup);

router.get("/login", login);

router.get("/logout", logout);

router.post("/onboarding", protectRoute, onboard);

router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, message: "Onboarding successful" });
});

export default router;