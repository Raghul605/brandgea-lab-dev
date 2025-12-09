import express from "express";
import {
  createPaymentController,
//   zohoPaymentWebhookController,
  PaymentWidgetResponseController,
  PaymentWidgetSuccessController,
} from "../controllers/leadPaymentsController.js";

const router = express.Router();

// Route to create a payment session
router.post("/payments/create", createPaymentController);
router.post("/payments/widget-response", PaymentWidgetResponseController);
router.post("/payments/widget-success", PaymentWidgetSuccessController);

// Webhook endpoint for Zoho payment updates
// router.post('/payments/zoho-webhook', zohoPaymentWebhookController);

export default router;
