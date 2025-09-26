import express from "express";
import {
  // makePayments,
  // zohoPaymentWebhook,
  // createPaymentSession,
  oauthCallbackController,
  createPaymentSessionController,
  zohoPaymentWebhookController,
} from "../controllers/paymentsController.js";

const router = express.Router();

router.post("/initiate", createPaymentSessionController);
router.post("/webhook", zohoPaymentWebhookController);

// // Zoho will POST here with payment results
// router.post("/webhook", express.json({ type: "*/*" }), zohoPaymentWebhook);

// router.post("/session", createPaymentSession);

router.get("/oauth/callback", oauthCallbackController);

export default router;
