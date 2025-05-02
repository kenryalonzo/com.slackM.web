import User from "../models/User";
import FriendRequest from "../models/FriendRequest";

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user.user.id;
        const currentUser = req.user

        const recommendedUsers = await User.find({
            $and: {
                _id: { $ne: currentUserId }, // Exclude the current user
                $id: { $nin: currentUser.friends }, // Exclude friends
                isOnboarding: true, // Only include users who have completed onboarding
            },
        });
        res.status(200).json({ success: true, users: recommendedUsers });
    } catch (error) {
        console.error("Error in getRecommendedUsers controller", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.user.id)
        .select("friends")
        .populate("friends", "fulName profilePicture nativeLanguage learningLanguage");

        res.status(200).json({ success: true, friends: user.friends });
    } catch (error) {
        console.error("Error in getMyFriends controller", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user.id;
        const { id: recipientId } = req.params;

        if (myId === recipientId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found" });
        }

        if (recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "You are already friends with this user" });
        }

        // check if the recipient has already sent a friend request
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId },
            ],
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent" });
        }


        const newRequest = new FriendRequest({
            sender: myId,
            recipient: recipientId,
        });

        await newRequest.save();
        res.status(200).json({ success: true, message: "Friend request sent" });
    } catch (error) {
        console.error("Error in sendFriendRequest controller", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to accept this request" });
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        // add each user to the other's friends list
        // $addToSet ensures that the user is added only if they are not already in the array

        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient },
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender },
        });


    } catch (error) {
        console.error("Error in acceptFriendRequest controller", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function getFriendRequests(req, res) {
    try {
        const incomingRequests = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        })
        .populate("sender", "fulName profilePicture nativeLanguage learningLanguage");

        const acceptedRequests = await FriendRequest.find({
            sender: req.user.id,
            status: "accepted",
        })
        .populate("recipient", "fulName profilePicture");

        res.status(200).json({ success: true, incomingRequests, acceptedRequests });
    } catch (error) {
        
        console.error("Error in getFriendRequests controller", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function getOutgoingFriendRequests(req, res) {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender: req.user.id,
            status: "pending",
        })
        .populate("recipient", "fulName profilePicture nativeLanguage learningLanguage");

        res.status(200).json({ success: true, outgoingRequests });
    } catch (error) {
        console.error("Error in getOutgoingFriendRequests controller", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}