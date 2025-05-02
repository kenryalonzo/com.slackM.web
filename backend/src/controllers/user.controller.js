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