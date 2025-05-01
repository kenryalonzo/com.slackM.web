import { StreamChat } from 'stream-chat';
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
    console.log("Stream API key or secret is not set");
    throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const createStreamUser = async (userId, userData) => {
    try {
        const token = streamClient.createToken(userId);
        const user = {
            id: userId,
            ...userData,
            token,
        };
        await streamClient.upsertUser(user);
        return user;
    } catch (error) {
        console.error("Error creating Stream user:", error);
        throw error;
    }
}

