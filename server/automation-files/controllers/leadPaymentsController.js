import LeadManagement from "../../models/LeadToVendorManagementModel.js";
import LeadPaymentTransactions from "../../models/LeadPaymentTransactionModel.js";
import VendorDetails from "../../models/vendorDetailsModel.js";
import { getValidZohoAccessToken } from "../../controllers/paymentsController.js";
import axios from "axios";
import mongoose from "mongoose";
import LeadMailingFunc from "../../utils/leadMailingFunc.js";

// Parse PAYMENT_KEYS JSON string from .env file
const PAYMENT_KEYS = process.env.PAYMENT_KEYS
  ? JSON.parse(process.env.PAYMENT_KEYS)
  : {
      basic_plan_99: 99,
      standard_plan_999: 999,
      lead_test_plan: 1,
    };

export async function createPaymentController(req, res) {
  try {
    const { leadId, vendorEmail, amountQuoted, planKey } = req.body;

    // Validate required params
    if (!leadId || !vendorEmail || !amountQuoted || !planKey) {
      return res.status(400).json({
        error:
          "Missing required fields: leadId, vendorEmail, amountQuoted, planKey",
      });
    }

    // Get payment amount from planKey
    const amountToPay = PAYMENT_KEYS[planKey];
    if (!amountToPay || amountToPay <= 0) {
      return res.status(400).json({
        error: `Invalid planKey or amount not found: ${planKey}`,
      });
    }

    // ✅ Load lead - supports ObjectId OR custom LeadID (L0001NOV25)
    let lead;
    if (mongoose.Types.ObjectId.isValid(leadId)) {
      lead = await LeadManagement.findById(leadId);
    } else {
      lead = await LeadManagement.findOne({ LeadID: leadId });
    }
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Check quote limits
    if (lead.number_of_recieved_quotes >= lead.max_number_of_allowed_quotes) {
      return res
        .status(400)
        .json({ error: "Max quotes reached for this lead" });
    }

    // ✅ FIXED: Check vendor duplicate (ONLY paid states) + CLEAR MESSAGE
    const hasExistingPayment = lead.vendor_quotes.some(
      (vq) =>
        vq.VendorEmail === vendorEmail &&
        ["success_pre_confirmation", "succeeded"].includes(vq.Status)
    );

    if (hasExistingPayment) {
      return res.status(400).json({
        error: `Vendor ${vendorEmail} already paid for Lead ${lead.LeadID}`,
        alreadyPaid: true,
      });
    }

    // Verify vendor exists
    const vendor = await VendorDetails.findOne({ VendorEmail: vendorEmail });
    if (!vendor) {
      return res.status(400).json({ error: "Vendor not registered" });
    }

    const userId = lead.userId;
    const chatId = lead.chatId;
    const description = `Payment for Lead ${lead.LeadID}`;

    // Zoho metadata ✅ 5 items max
    const metaData = [
      { key: "lead_id", value: lead._id.toString() },
      { key: "user_id", value: userId?.toString() || "" },
      // { key: "chat_id", value: chatId || "" },
      { key: "vendor_email", value: vendorEmail },
      { key: "payment_category", value: "lead_quoting_payment" },
    ];

    const payload = {
      amount: amountToPay,
      currency: "INR",
      description,
      meta_data: metaData,
      invoice_number: `INV-${Date.now().toString().slice(-6)}`,
    };

    // Create Zoho payment session
    const accessToken = await getValidZohoAccessToken();
    const zohoResponse = await axios.post(
      `https://payments.zoho.in/api/v1/paymentsessions?account_id=${process.env.ZOHO_ACCOUNT_ID}`,
      payload,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paymentSession = zohoResponse.data.payments_session;
    if (!paymentSession) {
      return res
        .status(500)
        .json({ error: "Failed to create Zoho payment session" });
    }

    // ✅ PERFECT 15-MIN EXIRY FROM CREATION TIME (UTC)
    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

    console.log("🕐 Payment created:", now.toISOString());
    console.log("⏰ Expiry set to:", fifteenMinutesFromNow.toISOString());
    console.log(
      "⏱️ Duration:",
      (fifteenMinutesFromNow - now) / 1000 / 60,
      "minutes"
    );

    // Create payment transaction
    const paymentTransaction = new LeadPaymentTransactions({
      paymentId: paymentSession.payments_session_id,
      payments_session_id: paymentSession.payments_session_id,
      amountQuoted,
      amountPaid: amountToPay,
      currency: "INR",
      status: "pending",
      transactionDate: now,
      expiryTime: fifteenMinutesFromNow,
      Lead_doc_id: lead._id,
      LeadID: lead.LeadID,
      vendorId: vendor._id,
      VendorEmail: vendorEmail,
      userId,
      description,
      payment_category: "lead_quoting_payment",
      session_created_time: paymentSession.created_time,
    });
    await paymentTransaction.save();

    console.log("✅ Payment created successfully");
    console.log("Session ID:", paymentSession.payments_session_id);
    console.log("Transaction ID:", paymentTransaction._id);

    res.status(201).json({
      message: "Payment session created successfully",
      paymentSessionId: paymentSession.payments_session_id,
      transactionId: paymentTransaction._id.toString(),
      Lead_doc_id: lead._id.toString(),
    });
  } catch (error) {
    console.error("❌ createPaymentController error:", error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: error.response.data.message || "Zoho API error",
        details: error.response.data,
      });
    }

    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}

export const PaymentWidgetResponseController = async (req, res) => {
  try {
    const { payments_session_id, responseType, Lead_doc_id } = req.body;

    if (!payments_session_id || !responseType) {
      return res
        .status(400)
        .json({ error: "Missing payments_session_id or responseType" });
    }

    // ✅ Find transaction by EXACT session ID
    const transaction = await LeadPaymentTransactions.findOne({
      payments_session_id: payments_session_id,
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // ✅ Skip ONLY webhook-processed OR succeeded transactions
    if (
      transaction.webhook_processed === true ||
      transaction.status === "succeeded" ||
      transaction.status === "success_pre_confirmation"
    ) {
      console.log(
        `⏭️ Widget response ignored - already processed: ${transaction.status}`
      );
      return res.status(200).json({
        message: `Transaction already processed (status: ${transaction.status})`,
      });
    }

    // ✅ Process NEW closed/failed sessions only
    if (responseType === "closed" || responseType === "failed") {
      await LeadPaymentTransactions.findOneAndUpdate(
        { _id: transaction._id },
        {
          status: responseType === "closed" ? "closed" : "failed", // ✅ Uses your new enum
          responseType,
          updatedAt: new Date(),
        }
      );

      console.log(`✅ Widget ${responseType}: ${payments_session_id}`);
    }

    res.status(200).json({ message: `Widget ${responseType} recorded` });
  } catch (error) {
    console.error("❌ PaymentWidgetResponseController error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export async function PaymentWidgetSuccessController(req, res) {
  try {
    const { Lead_doc_id, payment_id, payments_session_id } = req.body;

    // Validate required fields
    if (!Lead_doc_id || !payment_id || !payments_session_id) {
      return res.status(400).json({
        error:
          "Missing required fields: Lead_doc_id, payment_id, payments_session_id",
      });
    }

    const leadDocId = new mongoose.Types.ObjectId(Lead_doc_id);

    // 1. ✅ UPDATE LeadPaymentTransactions
    const transaction = await LeadPaymentTransactions.findOneAndUpdate(
      {
        Lead_doc_id: leadDocId,
        payments_session_id,
        status: "pending", // Safety check
      },
      {
        paymentId: payment_id,
        status: "success_pre_confirmation",
        widget_response: "success",
      },
      { new: true }
    );

    if (!transaction) {
      return res
        .status(404)
        .json({ error: "Pending payment transaction not found" });
    }

    // 2. ✅ Load LeadManagement + VendorDetails
    const lead = await LeadManagement.findById(leadDocId);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const vendor = await VendorDetails.findOne({
      VendorEmail: transaction.VendorEmail,
    });
    if (!vendor) {
      return res.status(400).json({ error: "Vendor not registered" });
    }

    // 3. ✅ NICHE SCENARIO CHECK: Max quotes limit
    const quoteLimitReached =
      lead.number_of_recieved_quotes >= lead.max_number_of_allowed_quotes;

    if (quoteLimitReached) {
      console.log(
        `⚠️ QUOTE LIMIT REACHED for Lead ${lead.LeadID} - Vendor ${transaction.VendorEmail}`
      );
      console.log(
        `Current quotes: ${lead.number_of_recieved_quotes}/${lead.max_number_of_allowed_quotes}`
      );

      // ✅ STILL update LeadPaymentTransactions (already done above)
      // ✅ STILL update VendorDetails transactionHistory
      // ❌ SKIP LeadManagement vendor_quotes update & counter increment
    } else {
      // ✅ NORMAL FLOW: Update LeadManagement vendor_quotes + increment counter
      const newVendorQuote = {
        VendorEmail: transaction.VendorEmail,
        customerEmailId: lead.CustomerEmail,
        paymentId: payment_id,
        amountQuoted: transaction.amountQuoted,
        amountPaid: transaction.amountPaid,
        Status: "success_pre_confirmation",
        expiryTime: transaction.expiryTime,
      };

      lead.vendor_quotes.push(newVendorQuote);
      lead.number_of_recieved_quotes += 1;
      await lead.save();
    }

    // 4. ✅ ALWAYS update VendorDetails transactionHistory
    const transactionHistoryEntry = {
      paymentId: payment_id,
      Lead_doc_id: leadDocId,
      LeadID: lead.LeadID,
      amountQuoted: transaction.amountQuoted,
      amountPaid: transaction.amountPaid,
      status: "success_pre_confirmation",
      payments_session_id: payments_session_id,
      payment_category: "lead_quoting_payment",
    };

    vendor.transactionHistory.push(transactionHistoryEntry);
    vendor.updatedAt = new Date();
    await vendor.save();

    console.log(
      `✅ Success pre-confirmation for Lead ${lead.LeadID}, Vendor ${transaction.VendorEmail}`
    );

    res.json({
      message: "Payment success pre-confirmation recorded",
      paymentId: payment_id,
      quoteLimitReached, // For frontend awareness
      currentQuotes: lead.number_of_recieved_quotes,
      maxQuotes: lead.max_number_of_allowed_quotes,
    });
  } catch (error) {
    console.error("❌ PaymentWidgetSuccessController error:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function handleLeadQuotingPaymentWebhook(event) {
  try {
    // Extract payment object
    const payment = event.event_object?.payment;
    if (!payment) {
      return {
        status: 400,
        body: { error: "Missing payment object in webhook." },
      };
    }

    const paymentId = payment.payment_id;
    if (!paymentId) {
      return { status: 400, body: { error: "Missing payment ID in webhook." } };
    }

    // Check payment_category = 'lead_quoting_payment'
    const metaData = payment.meta_data || [];
    const paymentCategory = metaData.find(
      (md) => md.key === "payment_category"
    )?.value;

    if (paymentCategory !== "lead_quoting_payment") {
      console.log(
        `⏭️ Webhook ignored - not lead_quoting_payment: ${paymentCategory}`
      );
      return {
        status: 200,
        body: { message: "Webhook ignored - wrong payment category" },
      };
    }

    const paymentStatus = payment.status;
    const paymentsSessionId = payment.payments_session_id;

    if (!paymentsSessionId) {
      return {
        status: 400,
        body: { error: "Missing payments_session_id in webhook." },
      };
    }

    // Find by payments_session_id
    const transaction = await LeadPaymentTransactions.findOne({
      payments_session_id: paymentsSessionId,
    });

    if (!transaction) {
      return {
        status: 404,
        body: { error: "Payment transaction not found by session ID." },
      };
    }

    // Only process success_pre_confirmation → succeeded
    if (transaction.status !== "success_pre_confirmation") {
      console.log(`⏭️ Webhook ignored - status: ${transaction.status}`);
      return {
        status: 200,
        body: { message: "Webhook ignored - wrong transaction status" },
      };
    }

    // 1. UPDATE LeadPaymentTransactions → dynamic status
    await LeadPaymentTransactions.findOneAndUpdate(
      { payments_session_id: paymentsSessionId },
      {
        paymentId: paymentId,
        status: paymentStatus,
        payment_created_time: new Date(payment.date * 1000),
        paymentMethod: payment.payment_method?.type || "unknown",
        amountPaid: parseFloat(payment.amount),
        webhook_processed: true,
        updatedAt: new Date(),
      }
    );

    // 2. UPDATE LeadManagement vendor_quotes → succeeded + QUOTE-CAP CHECK
    const lead = await LeadManagement.findById(transaction.Lead_doc_id);
    if (lead) {
      const vendorQuoteIndex = lead.vendor_quotes.findIndex(
        (vq) =>
          vq.paymentId === paymentId ||
          vq.VendorEmail === transaction.VendorEmail
      );

      if (vendorQuoteIndex !== -1) {
        lead.vendor_quotes[vendorQuoteIndex].Status = "succeeded";
        lead.vendor_quotes[vendorQuoteIndex].paymentMethod =
          payment.payment_method?.type;
        lead.updatedAt = new Date();
        await lead.save();

        console.log(
          `✅ Vendor quote updated: ${paymentId} → Lead ${lead.LeadID}`
        );
      }

      // ✅ QUOTE-CAP CHECK: Exactly max quotes reached → Close lead
      if (
        lead.number_of_recieved_quotes === lead.max_number_of_allowed_quotes &&
        lead.lead_status_active === true
      ) {
        // Mark lead inactive
        lead.lead_status_active = false;
        lead.updatedAt = new Date();
        await lead.save();

        // Delete from ActiveLeads (safe if missing)
        await ActiveLeads.deleteOne({ LeadID: lead.LeadID });
        console.log(
          `✅ Lead ${lead.LeadID} CLOSED - max ${lead.max_number_of_allowed_quotes} quotes reached`
        );
      }
    }

    // 3. UPDATE VendorDetails transactionHistory → succeeded
    const vendor = await VendorDetails.findOne({
      VendorEmail: transaction.VendorEmail,
    });
    if (vendor) {
      const historyIndex = vendor.transactionHistory.findIndex(
        (h) => h.payments_session_id === paymentsSessionId
      );

      if (historyIndex !== -1) {
        vendor.transactionHistory[historyIndex].status = "succeeded";
        vendor.transactionHistory[historyIndex].paymentId = paymentId;
        vendor.transactionHistory[historyIndex].paymentMethod =
          payment.payment_method?.type;
        vendor.updatedAt = new Date();
        await vendor.save();
      }
    }

    // 4. Send notification emails (only on success)
    if (paymentStatus === "succeeded") {
      const success = await LeadMailingFunc(transaction.Lead_doc_id, paymentId);
      console.log(
        success ? "✅ Emails sent successfully" : "⚠️ Email sending failed"
      );
    }

    console.log(`✅ Webhook processed: ${paymentId} → Lead ${transaction.LeadID}`);

    return {
      status: 200,
      body: {
        message: "Webhook processed successfully.",
        paymentId,
        leadId: transaction.LeadID,
        leadDocId: transaction.Lead_doc_id,
        paymentStatus,
      },
    };
  } catch (error) {
    console.error("❌ handleLeadQuotingPaymentWebhook error:", error);
    return { status: 500, body: { error: "Internal server error" } };
  }
}


// export const zohoPaymentWebhookController = async (req, res) => {
//   try {
//     const event = req.body;

//     // Extract payment object
//     const payment = event.event_object?.payment;
//     if (!payment) {
//       return res.status(400).json({ error: "Missing payment object in webhook." });
//     }

//     const paymentId = payment.payment_id;
//     if (!paymentId) {
//       return res.status(400).json({ error: "Missing payment ID in webhook." });
//     }

//     // ✅ Check payment_category = 'lead_quoting_payment'
//     const metaData = payment.meta_data || [];
//     const paymentCategory = metaData.find(md => md.key === 'payment_category')?.value;

//     if (paymentCategory !== 'lead_quoting_payment') {
//       console.log(`⏭️ Webhook ignored - not lead_quoting_payment: ${paymentCategory}`);
//       return res.status(200).json({ message: "Webhook ignored - wrong payment category" });
//     }

//     const paymentStatus = payment.status; // "succeeded"
//     const paymentsSessionId = payment.payments_session_id;

//     if (!paymentsSessionId) {
//       return res.status(400).json({ error: "Missing payments_session_id in webhook." });
//     }

//     // ✅ Find by payments_session_id
//     const transaction = await LeadPaymentTransactions.findOne({
//       payments_session_id: paymentsSessionId
//     });

//     if (!transaction) {
//       return res.status(404).json({ error: "Payment transaction not found by session ID." });
//     }

//     // ✅ Only process success_pre_confirmation → succeeded
//     if (transaction.status !== 'success_pre_confirmation') {
//       console.log(`⏭️ Webhook ignored - status: ${transaction.status}`);
//       return res.status(200).json({ message: "Webhook ignored - wrong transaction status" });
//     }

//     // 1. ✅ UPDATE LeadPaymentTransactions → succeeded
//     await LeadPaymentTransactions.findOneAndUpdate(
//       { payments_session_id: paymentsSessionId },
//       {
//         paymentId: paymentId,
//         status: 'succeeded',  // ✅ Matches your enum
//         payment_created_time: new Date(payment.date * 1000), // Unix → Date
//         paymentMethod: payment.payment_method?.type || 'unknown',
//         amountPaid: parseFloat(payment.amount),
//         webhook_processed: true,
//         updatedAt: new Date()
//       }
//     );

//     // 2. ✅ UPDATE LeadManagement vendor_quotes → succeeded
//     const lead = await LeadManagement.findById(transaction.Lead_doc_id);
//     if (lead) {
//       const vendorQuoteIndex = lead.vendor_quotes.findIndex(
//         vq => vq.paymentId === paymentId || vq.VendorEmail === transaction.VendorEmail
//       );

//       if (vendorQuoteIndex !== -1) {
//         lead.vendor_quotes[vendorQuoteIndex].Status = 'succeeded';  // ✅ Matches your enum
//         lead.vendor_quotes[vendorQuoteIndex].paymentMethod = payment.payment_method?.type;
//         lead.updatedAt = new Date();
//         await lead.save();
//       }
//     }

//     // 3. ✅ UPDATE VendorDetails transactionHistory → succeeded
//     const vendor = await VendorDetails.findOne({ VendorEmail: transaction.VendorEmail });
//     if (vendor) {
//       const historyIndex = vendor.transactionHistory.findIndex(
//         h => h.payments_session_id === paymentsSessionId
//       );

//       if (historyIndex !== -1) {
//         vendor.transactionHistory[historyIndex].status = 'succeeded';  // ✅ Matches your enum
//         vendor.transactionHistory[historyIndex].paymentId = paymentId;
//         vendor.transactionHistory[historyIndex].paymentMethod = payment.payment_method?.type;
//         vendor.updatedAt = new Date();
//         await vendor.save();
//       }
//     }

//     console.log(`✅ Webhook processed: ${paymentId} → Lead ${transaction.LeadID}`);

//     res.status(200).json({
//       message: "Webhook processed successfully.",
//       paymentId,
//       leadId: transaction.Lead_doc_id
//     });

//   } catch (error) {
//     console.error("❌ zohoPaymentWebhookController error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export async function handleLeadQuotingPaymentWebhook(event) {
//   try {
//     // Extract payment object
//     const payment = event.event_object?.payment;
//     if (!payment) {
//       return {
//         status: 400,
//         body: { error: "Missing payment object in webhook." },
//       };
//     }

//     const paymentId = payment.payment_id;
//     if (!paymentId) {
//       return { status: 400, body: { error: "Missing payment ID in webhook." } };
//     }

//     // Check payment_category = 'lead_quoting_payment'
//     const metaData = payment.meta_data || [];
//     const paymentCategory = metaData.find(
//       (md) => md.key === "payment_category"
//     )?.value;

//     if (paymentCategory !== "lead_quoting_payment") {
//       console.log(
//         `⏭️ Webhook ignored - not lead_quoting_payment: ${paymentCategory}`
//       );
//       return {
//         status: 200,
//         body: { message: "Webhook ignored - wrong payment category" },
//       };
//     }

//     const paymentStatus = payment.status;
//     const paymentsSessionId = payment.payments_session_id;

//     if (!paymentsSessionId) {
//       return {
//         status: 400,
//         body: { error: "Missing payments_session_id in webhook." },
//       };
//     }

//     // Find by payments_session_id
//     const transaction = await LeadPaymentTransactions.findOne({
//       payments_session_id: paymentsSessionId,
//     });

//     if (!transaction) {
//       return {
//         status: 404,
//         body: { error: "Payment transaction not found by session ID." },
//       };
//     }

//     // Only process success_pre_confirmation → succeeded
//     if (transaction.status !== "success_pre_confirmation") {
//       console.log(`⏭️ Webhook ignored - status: ${transaction.status}`);
//       return {
//         status: 200,
//         body: { message: "Webhook ignored - wrong transaction status" },
//       };
//     }

//     // 1. UPDATE LeadPaymentTransactions → succeeded
//     await LeadPaymentTransactions.findOneAndUpdate(
//       { payments_session_id: paymentsSessionId },
//       {
//         paymentId: paymentId,
//         status: paymentStatus,
//         payment_created_time: new Date(payment.date * 1000),
//         paymentMethod: payment.payment_method?.type || "unknown",
//         amountPaid: parseFloat(payment.amount),
//         webhook_processed: true,
//         updatedAt: new Date(),
//       }
//     );

//     // 2. UPDATE LeadManagement vendor_quotes → succeeded
//     const lead = await LeadManagement.findById(transaction.Lead_doc_id);
//     if (lead) {
//       const vendorQuoteIndex = lead.vendor_quotes.findIndex(
//         (vq) =>
//           vq.paymentId === paymentId ||
//           vq.VendorEmail === transaction.VendorEmail
//       );

//       if (vendorQuoteIndex !== -1) {
//         lead.vendor_quotes[vendorQuoteIndex].Status = "succeeded";
//         lead.vendor_quotes[vendorQuoteIndex].paymentMethod =
//           payment.payment_method?.type;
//         lead.updatedAt = new Date();
//         await lead.save();
//       }
//     }

//     // 3. UPDATE VendorDetails transactionHistory → succeeded
//     const vendor = await VendorDetails.findOne({
//       VendorEmail: transaction.VendorEmail,
//     });
//     if (vendor) {
//       const historyIndex = vendor.transactionHistory.findIndex(
//         (h) => h.payments_session_id === paymentsSessionId
//       );

//       if (historyIndex !== -1) {
//         vendor.transactionHistory[historyIndex].status = "succeeded";
//         vendor.transactionHistory[historyIndex].paymentId = paymentId;
//         vendor.transactionHistory[historyIndex].paymentMethod =
//           payment.payment_method?.type;
//         vendor.updatedAt = new Date();
//         await vendor.save();
//       }
//     }

//     console.log(
//       `✅ Webhook processed: ${paymentId} → Lead ${transaction.LeadID}`
//     );
//     // In handleLeadQuotingPaymentWebhook, after vendor update:
//     if (paymentStatus === "succeeded") {
//       const success = await LeadMailingFunc(transaction.Lead_doc_id, paymentId);
//       console.log(
//         success ? "✅ Emails sent successfully" : "⚠️ Email sending failed"
//       );
//     }

//     return {
//       status: 200,
//       body: {
//         message: "Webhook processed successfully.",
//         paymentId,
//         leadId: transaction.LeadID,
//         leadDocId: transaction.Lead_doc_id,
//       },
//     };
//   } catch (error) {
//     console.error("❌ handleLeadQuotingPaymentWebhook error:", error);
//     return { status: 500, body: { error: "Internal server error" } };
//   }
// }
