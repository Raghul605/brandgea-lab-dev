// import express from 'express';
// import { getQuoteGarmentsChatWithUser,getProductWithUserAndChat } from '../controllers/clothingController.js'; // adjust path
// import adminAuth from '../middleware/adminAuth.js';


// const router = express.Router();

// router.get('/quote-garments-chat-user', adminAuth, getQuoteGarmentsChatWithUser);
// router.get('/quote-details-product/:productId', adminAuth, getProductWithUserAndChat);

// export default router;


import express from "express";
import {
  getQuoteGarmentsChatWithUser,
  getProductWithUserAndChat,
  getAllUsers,
  getUserDetails,
  deleteQuote,
  findChatsByUser,
  getChatDetails
} from "../controllers/clothingController.js"; 
import adminAuth from '../middleware/adminAuth.js';// adjust path

const router = express.Router();

router.get("/quote-garments-chat-user",adminAuth, getQuoteGarmentsChatWithUser);
router.get("/quote-details-product/:productId",adminAuth, getProductWithUserAndChat);
router.get("/all-users",adminAuth, getAllUsers);
router.get("/user-details/:userId",adminAuth, getUserDetails);
router.get("/all-user-chats/:userId",adminAuth, findChatsByUser);
router.get("/chat-details/:userId/:chatId",adminAuth,getChatDetails);
router.delete("/quote/:id", adminAuth, deleteQuote); // <-- use `id` instead of `productId`



export default router;