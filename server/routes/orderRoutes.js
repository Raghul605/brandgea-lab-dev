import express from "express";
import {
  getOrdersByEmail,
  getOrderById,
  getOrdersByUserId,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/all-orders", getOrdersByEmail);
router.get("/orders/by-user/:userId", getOrdersByUserId);
router.get("/order-details/:id", getOrderById);


export default router;
