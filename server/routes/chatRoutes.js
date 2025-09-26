import express from "express";
import {
  createNewChat,
  getUserChats,
  getSingleChat,
  updateChatHeading,
  deleteProductChatAndImages,
  deleteMultipleProductsAndChats
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route for creating a new chat session
// router.post("/new-chat", protect, createNewChat);
router.post("/new-chat", createNewChat);
router.get("/previous-chats/:userId", getUserChats);
router.get("/open-chat/:userId/:chatId", getSingleChat);
router.patch('/update-heading/:chatId', updateChatHeading);
router.delete("/delete-chat", deleteProductChatAndImages);
router.delete("/delete-multiple-products", deleteMultipleProductsAndChats);


export default router;