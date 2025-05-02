import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getRecommendedUsers, getMyFriends } from "../controllers/user.controller.js";

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends); 

router.post("/friend-request/:Id", sendFriendRequest);
router.put("/friend-request/:Id/accept", acceptFriendRequest);

export default router;