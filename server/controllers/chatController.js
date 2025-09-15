import User from "../models/User.js";
import mongoose from "mongoose";

// export const createNewChat = async (req, res) => {
//   try {
//     const userId = req.body.userId;
//     if (!userId) {
//       return res
//         .status(400)
//         .json({ error: "User ID is required in the request body." });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Create a new chat session with default heading
//     const newChat = {
//       heading: "New Chat", // Default heading
//       messages: [],
//       manufacturing_costs: null,
//       isCompleted: false,
//       createdAt: new Date(),
//     };

//     user.chat.push(newChat);
//     await user.save();

//     // Get the new chat's _id
//     const chatId = user.chat[user.chat.length - 1]._id;
//     return res.status(201).json({ chatId, heading: "New Chat" });
//   } catch (error) {
//     console.error("createNewChat error:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

export const createNewChat = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const newChat = {
      heading: "New Chat",
      messages: [],
      state: "collecting",
      pending_tech_pack: null,
      confirmed_tech_pack: null,
      manufacturing_costs: null,
      isCompleted: false,
      createdAt: new Date(),
    };

    user.chat.push(newChat);
    await user.save();

    const chatId = user.chat[user.chat.length - 1]._id;
    res.status(201).json({ chatId, heading: "New Chat" });
  } catch (error) {
    console.error("createNewChat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const DEFAULT_CHAT_LIMIT = process.env.DEFAULT_CHAT_LIMIT_getUserChats || 15;
const DEFAULT_CHAT_FROM_DATE = process.env.CHAT_FROM_DATE || "2025-08-26";

export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params; 
    let { fromDate, page, limit } = req.query;

    fromDate = fromDate || DEFAULT_CHAT_FROM_DATE;
    page = parseInt(page) >= 0 ? parseInt(page) : 0;
    limit = parseInt(limit) || DEFAULT_CHAT_LIMIT;

    // Validate that userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Find the user by MongoDB _id
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Filter chats by createdAt >= fromDate
    const filteredChats = user.chat
      .filter((chat) => new Date(chat.createdAt) >= new Date(fromDate))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // descending sort

    // Paginate results
    const paginatedChats = filteredChats.slice(
      page * limit,
      (page + 1) * limit
    );

    // Map to only send chat _id and heading
    const response = paginatedChats.map((chat) => ({
      chatId: chat._id,
      heading: chat.heading,
      createdAt: chat.createdAt,
    }));

    res.json({
      chats: response,
      page,
      limit,
      totalChats: filteredChats.length,
    });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getSingleChat = async (req, res) => {
  try {
    const { userId, chatId } = req.params;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    // Find the user by _id
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the chat document in user's chat array by chatId
    const chat = user.chat.id(chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Return the full chat object (including heading, messages, manufacturing_costs, etc.)
    res.json({ chat });
  } catch (error) {
    console.error("Error getting chat by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateChatHeading = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { heading } = req.body;

    // Find the user that contains this chat
    const user = await User.findOne({ "chat._id": chatId });
    
    if (!user) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Find the specific chat and update its heading
    const chat = user.chat.id(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.heading = heading;
    await user.save();

    res.json({ 
      message: 'Chat heading updated successfully', 
      chat: {
        _id: chat._id,
        heading: chat.heading,
        // include other fields if needed
      }
    });
  } catch (error) {
    console.error('Error updating chat heading:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};