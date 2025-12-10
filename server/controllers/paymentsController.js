// import axios from "axios";
// import User from "../models/User.js";
// import ManufacturerFindTransaction from "../models/ManufacturerFindTransaction.js";
// import ZohoOauthToken from "../models/ZohoOauthToken.js";
// import sendPaymentReceiptEmail from "../utils/sendPaymentReceiptEmail.js";
// import Product from "../models/product.js";

// const PAYMENT_KEYS = JSON.parse(
//   process.env.PAYMENT_KEYS || {
//     basic_plan_499: Number(process.env.basic_plan_499 || 499),
//     standard_plan_999: Number(process.env.standard_plan_999 || 999),
//   }
// );
// // const ZOHO_ACCOUNT_ID = process.env.ZOHO_ACCOUNT_ID || "";
// // const ZOHO_API_TOKEN = process.env.ZOHO_API_TOKEN || "";

// export const oauthCallbackController = async (req, res) => {
//   const authorizationCode = req.query.code;
//   console.log("Received authorization code:", authorizationCode);

//   if (!authorizationCode) {
//     console.error("Authorization code is missing");
//     return res.status(400).send("Authorization code is missing");
//   }

//   try {
//     const tokenResponse = await axios.post(
//       "https://accounts.zoho.in/oauth/v2/token",
//       null,
//       {
//         params: {
//           grant_type: "authorization_code",
//           client_id: process.env.ZOHO_CLIENT_ID,
//           client_secret: process.env.ZOHO_CLIENT_SECRET,
//           redirect_uri: process.env.ZOHO_REDIRECT_URI,
//           code: authorizationCode,
//         },
//       }
//     );

//     console.log("Token response data:", tokenResponse.data);

//     const { access_token, refresh_token, expires_in } = tokenResponse.data;
//     console.log("Access Token:", access_token);
//     console.log("Refresh Token:", refresh_token);
//     console.log("Expires In:", expires_in);

//     const expiresAt = new Date(Date.now() + expires_in * 1000);
//     console.log("Calculated token expiry time:", expiresAt);

//     const existingTokenDoc = await ZohoOauthToken.findOne({});
//     console.log("Existing token document:", existingTokenDoc);

//     const newRefreshToken =
//       refresh_token ||
//       (existingTokenDoc ? existingTokenDoc.refreshToken : null);
//     console.log("Final refresh token to save:", newRefreshToken);

//     const savedTokenDoc = await ZohoOauthToken.findOneAndUpdate(
//       {},
//       {
//         accessToken: access_token,
//         refreshToken: newRefreshToken,
//         expiresAt: expiresAt,
//         updatedAt: new Date(),
//       },
//       { upsert: true, new: true }
//     );

//     console.log("Saved token document:", savedTokenDoc);

//     res.send("Authorization successful. You can close this window.");
//   } catch (error) {
//     console.error(
//       "OAuth token exchange failed:",
//       error.response?.data || error.message
//     );
//     res.status(500).send("Token exchange failed");
//   }
// };

// export async function getValidZohoAccessToken() {
//   const tokenDoc = await ZohoOauthToken.findOne({});
//   if (!tokenDoc) {
//     throw new Error("No OAuth tokens found; please authorize first.");
//   }

//   const now = new Date();
//   let accessToken = tokenDoc.accessToken;

//   // Refresh if expired or near expiry (<1 min)
//   if (tokenDoc.expiresAt <= now || tokenDoc.expiresAt - now < 60000) {
//     const refreshResponse = await axios.post(
//       "https://accounts.zoho.in/oauth/v2/token",
//       null,
//       {
//         params: {
//           refresh_token: tokenDoc.refreshToken,
//           client_id: process.env.ZOHO_CLIENT_ID,
//           client_secret: process.env.ZOHO_CLIENT_SECRET,
//           grant_type: "refresh_token",
//         },
//       }
//     );
//     accessToken = refreshResponse.data.access_token;
//     tokenDoc.accessToken = accessToken;
//     tokenDoc.expiresAt = new Date(
//       Date.now() + refreshResponse.data.expires_in * 1000
//     );
//     await tokenDoc.save();
//   }

//   return accessToken;
// }

// // const PAYMENT_KEYS = {

// // };

// export const createPaymentSessionController = async (req, res) => {
//   const { userId, chatId, planKey, description, currency = "INR" } = req.body;

//   if (!userId || !chatId || !planKey) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     // Get amount from PAYMENT_KEYS using planKey
//     const amount = PAYMENT_KEYS[planKey];
//     if (!amount) {
//       return res.status(400).json({ error: `Invalid planKey: ${planKey}` });
//     }

//     // Create a new ManufacturerFindTransaction document
//     const newTransaction = new ManufacturerFindTransaction({
//       userId,
//       chatId,
//       description,
//       currency,
//       amount,
//       status: "pending",
//       session_created_time: Math.floor(Date.now() / 1000), // current unix timestamp (seconds)
//     });

//     await newTransaction.save();

//     // Prepare Zoho payment session payload
//     const metaData = [
//       { key: "doc_id", value: newTransaction._id.toString() },
//       { key: "user_id", value: userId },
//       { key: "chat_id", value: chatId },
//     ];

//     const payload = {
//       amount,
//       currency,
//       meta_data: metaData,
//       description,
//       invoice_number: `INV-${newTransaction._id.toString().slice(-6)}`, // example invoice number
//     };

//     // Get access token from your token handling (assumed helper function)
//     const accessToken = await getValidZohoAccessToken();

//     // Call Zoho Payments API to create payment session
//     const zohoResponse = await axios.post(
//       `https://payments.zoho.in/api/v1/paymentsessions?account_id=${process.env.ZOHO_ACCOUNT_ID}`,
//       payload,
//       {
//         headers: {
//           Authorization: `Zoho-oauthtoken ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const paymentSession = zohoResponse.data.payments_session;

//     if (!paymentSession) {
//       return res.status(500).json({ error: "Payment session creation failed" });
//     }

//     newTransaction.payments_session_id = paymentSession.payments_session_id;
//     newTransaction.message = zohoResponse.data.message || "success";
//     newTransaction.session_created_time = paymentSession.created_time;
//     newTransaction.updatedAt = new Date();

//     await newTransaction.save();

//     // Update user's transactions array
//     await User.findByIdAndUpdate(userId, {
//       $push: {
//         transactions: {
//           ManufacturerFind_collectionId: newTransaction._id,
//           payments_session_id: paymentSession.payments_session_id,
//           chatId: chatId,
//           createdAt: new Date(),
//         },
//       },
//     });

//     // Send relevant details to frontend
//     res.json({
//       payments_session_id: paymentSession.payments_session_id,
//       amount: paymentSession.amount,
//       currency: paymentSession.currency,
//       description: paymentSession.description,
//       invoice_number: paymentSession.invoice_number,
//       doc_id: newTransaction._id,
//       userId,
//       chatId,
//     });
//   } catch (error) {
//     console.error("Error createPaymentSessionController:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const zohoPaymentWebhookController = async (req, res) => {
//   try {
//     const event = req.body;

//     // Extract payment object from nested event_object
//     const payment = event.event_object?.payment;

//     if (!payment) {
//       return res.status(400).json({ error: "Missing payment object in webhook" });
//     }

//     // Extract doc_id from meta_data array
//     const metaData = payment.meta_data || [];
//     const docIdEntry = metaData.find((item) => item.key === "doc_id");
//     if (!docIdEntry || !docIdEntry.value) {
//       return res.status(400).json({ error: "Missing doc_id in meta_data" });
//     }
//     const docId = docIdEntry.value;

//     // Extract fields for update
//     const paymentId = payment.payment_id || "";
//     const paymentCreatedTime = payment.date || null; // Unix timestamp or as provided
//     const paymentStatus = (payment.status || "unknown").toLowerCase();

//     // Find the transaction document by ID
//     const transaction = await ManufacturerFindTransaction.findById(docId);
//     if (!transaction) {
//       return res.status(404).json({ error: "Transaction document not found" });
//     }

//     // Update transaction fields
//     transaction.payment_id = paymentId;
//     transaction.status = paymentStatus;
//     transaction.payment_created_time = paymentCreatedTime;
//     transaction.updatedAt = new Date();

//     await transaction.save();

//     // For successful payments: send receipt and update user chat flag
//     if (
//       paymentStatus === "succeeded" &&
//       transaction.chatId &&
//       transaction.userId
//     ) {
//       // Get user's details
//       const user = await User.findById(transaction.userId);
//       const userEmail = user ? user.email : "";
//       const userName = user ? user.name || "" : "";
//       const userMobile = user ? user.mobile || "" : "";

//       // Find product and extract tech_pack & manufacturing_costs
//       const product = await Product.findOne({
//         userId: transaction.userId,
//         chatId: transaction.chatId,
//       });
//       const techPack = product ? product.tech_pack : null;
//       const manufacturingCosts = product ? product.manufacturing_costs : null;

//       // Fire-and-forget sending payment receipt email
//       sendPaymentEmails({
//         userEmail,
//         userName,
//         userMobile,
//         docId,
//         techPack,
//         manufacturingCosts,
//       }).catch((err) => {
//         console.error("Error sending payment emails:", err);
//       });

//       // Update user's chat message Payments_For_ManufacturerFind flag
//       await User.updateOne(
//         { _id: transaction.userId, "chat._id": transaction.chatId },
//         {
//           $set: {
//             "chat.$.Payments_For_ManufacturerFind": true,
//           },
//         },
//         {
//           arrayFilters: [
//             {
//               $or: [
//                 { "msg.Payments_For_ManufacturerFind": false },
//                 { "msg.Payments_For_ManufacturerFind": { $exists: false } },
//               ],
//             },
//           ],
//         }
//       );
//     }

//     res.status(200).json({ message: "Webhook processed successfully" });
//   } catch (error) {
//     console.error("Error processing Zoho payment webhook:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const getManufacturerFindTransactions = async (req, res) => {
//   try {
//     const page = Number(req.query.page) || 1; // 1-based, default page 1
//     const sortOrder = req.query.sort === "desc" ? -1 : 1;
//     const limit = 10;
//     const skip = (page - 1) * limit;

//     // Only fetch fields needed
//     const transactions = await ManufacturerFindTransaction.find(
//       {},
//       "_id status amount"
//     )
//       .sort({ createdAt: sortOrder })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     // Total docs for numbering
//     const totalDocs = await ManufacturerFindTransaction.countDocuments();

//     // Add serial numbers
//     const numbered = transactions.map((doc, idx) => ({
//       serialNumber: skip + idx + 1, // e.g. page 2 starts at 11
//       doc_id: doc._id,
//       status: doc.status,
//       amount: doc.amount,
//     }));

//     res.json({
//       page,
//       totalDocs,
//       results: numbered,
//     });
//   } catch (err) {
//     console.error("Get ManufacturerFindTransactions error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const getManufacturerFindTransactionById = async (req, res) => {
//   try {
//     const { doc_id } = req.params; // expects doc_id param in route

//     const doc = await ManufacturerFindTransaction.findById(doc_id);
//     if (!doc) {
//       return res.status(404).json({ error: "Document not found" });
//     }

//     res.json(doc);
//   } catch (error) {
//     console.error("Get ManufacturerFindTransaction by ID error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


//During 9-12-2025
// import axios from "axios";
// import User from "../models/User.js";
// import ManufacturerFindTransaction from "../models/ManufacturerFindTransaction.js";
// import ZohoOauthToken from "../models/ZohoOauthToken.js";
// import sendPaymentReceiptEmail from "../utils/sendPaymentReceiptEmail.js";
// import Product from "../models/product.js";
// import processLeadTransactions from "../utils/processLeadTransactions.js";
// import { handleLeadQuotingPaymentWebhook } from "../automation-files/controllers/leadPaymentsController.js";

// const PAYMENT_KEYS = JSON.parse(
//   process.env.PAYMENT_KEYS || {
//     basic_plan_499: Number(process.env.basic_plan_499 || 499),
//     standard_plan_999: Number(process.env.standard_plan_999 || 999),
//   }
// );
// // const ZOHO_ACCOUNT_ID = process.env.ZOHO_ACCOUNT_ID || "";
// // const ZOHO_API_TOKEN = process.env.ZOHO_API_TOKEN || "";

// export const oauthCallbackController = async (req, res) => {
//   const authorizationCode = req.query.code;
//   console.log("Received authorization code:", authorizationCode);

//   if (!authorizationCode) {
//     console.error("Authorization code is missing");
//     return res.status(400).send("Authorization code is missing");
//   }

//   try {
//     const tokenResponse = await axios.post(
//       "https://accounts.zoho.in/oauth/v2/token",
//       null,
//       {
//         params: {
//           grant_type: "authorization_code",
//           client_id: process.env.ZOHO_CLIENT_ID,
//           client_secret: process.env.ZOHO_CLIENT_SECRET,
//           redirect_uri: process.env.ZOHO_REDIRECT_URI,
//           code: authorizationCode,
//         },
//       }
//     );

//     console.log("Token response data:", tokenResponse.data);

//     const { access_token, refresh_token, expires_in } = tokenResponse.data;
//     console.log("Access Token:", access_token);
//     console.log("Refresh Token:", refresh_token);
//     console.log("Expires In:", expires_in);

//     const expiresAt = new Date(Date.now() + expires_in * 1000);
//     console.log("Calculated token expiry time:", expiresAt);

//     const existingTokenDoc = await ZohoOauthToken.findOne({});
//     console.log("Existing token document:", existingTokenDoc);

//     const newRefreshToken =
//       refresh_token ||
//       (existingTokenDoc ? existingTokenDoc.refreshToken : null);
//     console.log("Final refresh token to save:", newRefreshToken);

//     const savedTokenDoc = await ZohoOauthToken.findOneAndUpdate(
//       {},
//       {
//         accessToken: access_token,
//         refreshToken: newRefreshToken,
//         expiresAt: expiresAt,
//         updatedAt: new Date(),
//       },
//       { upsert: true, new: true }
//     );

//     console.log("Saved token document:", savedTokenDoc);

//     res.send("Authorization successful. You can close this window.");
//   } catch (error) {
//     console.error(
//       "OAuth token exchange failed:",
//       error.response?.data || error.message
//     );
//     res.status(500).send("Token exchange failed");
//   }
// };

// export async function getValidZohoAccessToken() {
//   const tokenDoc = await ZohoOauthToken.findOne({});
//   if (!tokenDoc) {
//     throw new Error("No OAuth tokens found; please authorize first.");
//   }

//   const now = new Date();
//   let accessToken = tokenDoc.accessToken;

//   // Refresh if expired or near expiry (<1 min)
//   if (tokenDoc.expiresAt <= now || tokenDoc.expiresAt - now < 60000) {
//     const refreshResponse = await axios.post(
//       "https://accounts.zoho.in/oauth/v2/token",
//       null,
//       {
//         params: {
//           refresh_token: tokenDoc.refreshToken,
//           client_id: process.env.ZOHO_CLIENT_ID,
//           client_secret: process.env.ZOHO_CLIENT_SECRET,
//           grant_type: "refresh_token",
//         },
//       }
//     );
//     accessToken = refreshResponse.data.access_token;
//     tokenDoc.accessToken = accessToken;
//     tokenDoc.expiresAt = new Date(
//       Date.now() + refreshResponse.data.expires_in * 1000
//     );
//     await tokenDoc.save();
//   }

//   return accessToken;
// }



// export const createPaymentSessionController = async (req, res) => {
//   const { userId, chatId, planKey, description, currency = "INR" } = req.body;

//   if (!userId || !chatId || !planKey) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     // Get amount from PAYMENT_KEYS using planKey
//     const amount = PAYMENT_KEYS[planKey];
//     if (!amount) {
//       return res.status(400).json({ error: `Invalid planKey: ${planKey}` });
//     }

//     // Create a new ManufacturerFindTransaction document
//     const newTransaction = new ManufacturerFindTransaction({
//       userId,
//       chatId,
//       description,
//       currency,
//       amount,
//       status: "pending",
//       session_created_time: Math.floor(Date.now() / 1000), // current unix timestamp (seconds)
//     });

//     await newTransaction.save();

//     // Prepare Zoho payment session payload
//     const metaData = [
//       { key: "doc_id", value: newTransaction._id.toString() },
//       { key: "user_id", value: userId },
//       { key: "chat_id", value: chatId },
//       { key: "payment_category", value: "manufacturer_find_payment" },
//     ];

//     const payload = {
//       amount,
//       currency,
//       meta_data: metaData,
//       description,
//       invoice_number: `INV-${newTransaction._id.toString().slice(-6)}`, // example invoice number
//     };

//     // Get access token from your token handling (assumed helper function)
//     const accessToken = await getValidZohoAccessToken();

//     // Call Zoho Payments API to create payment session
//     const zohoResponse = await axios.post(
//       `https://payments.zoho.in/api/v1/paymentsessions?account_id=${process.env.ZOHO_ACCOUNT_ID}`,
//       payload,
//       {
//         headers: {
//           Authorization: `Zoho-oauthtoken ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const paymentSession = zohoResponse.data.payments_session;

//     if (!paymentSession) {
//       return res.status(500).json({ error: "Payment session creation failed" });
//     }

//     newTransaction.payments_session_id = paymentSession.payments_session_id;
//     newTransaction.message = zohoResponse.data.message || "success";
//     newTransaction.session_created_time = paymentSession.created_time;
//     newTransaction.updatedAt = new Date();

//     await newTransaction.save();

//     // Update user's transactions array
//     await User.findByIdAndUpdate(userId, {
//       $push: {
//         transactions: {
//           ManufacturerFind_collectionId: newTransaction._id,
//           payments_session_id: paymentSession.payments_session_id,
//           chatId: chatId,
//           createdAt: new Date(),
//         },
//       },
//     });

//     // Send relevant details to frontend
//     res.json({
//       payments_session_id: paymentSession.payments_session_id,
//       amount: paymentSession.amount,
//       currency: paymentSession.currency,
//       description: paymentSession.description,
//       invoice_number: paymentSession.invoice_number,
//       doc_id: newTransaction._id,
//       userId,
//       chatId,
//     });
//   } catch (error) {
//     console.error("Error createPaymentSessionController:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// // export const zohoPaymentWebhookController = async (req, res) => {
// //   try {
// //     const event = req.body;

// //     // Extract payment object from nested event_object
// //     const payment = event.event_object?.payment;
// //     if (!payment) {
// //       return res.status(400).json({ error: "Missing payment object in webhook" });
// //     }

// //     // Extract doc_id from meta_data array
// //     const metaData = payment.meta_data || [];
// //     const docIdEntry = metaData.find((item) => item.key === "doc_id");
// //     if (!docIdEntry || !docIdEntry.value) {
// //       return res.status(400).json({ error: "Missing doc_id in meta_data" });
// //     }
// //     const docId = docIdEntry.value;

// //     // Extract fields for update
// //     const paymentId = payment.payment_id || "";
// //     const paymentCreatedTime = payment.date || null;
// //     const paymentStatus = (payment.status || "unknown").toLowerCase();

// //     // Find the transaction document by ID
// //     const transaction = await ManufacturerFindTransaction.findById(docId);
// //     if (!transaction) {
// //       return res.status(404).json({ error: "Transaction document not found" });
// //     }

// //     // Update transaction fields
// //     transaction.payment_id = paymentId;
// //     transaction.status = paymentStatus;
// //     transaction.payment_created_time = paymentCreatedTime;
// //     transaction.updatedAt = new Date();
// //     await transaction.save();

// //     // For successful payments: send receipt and update user chat flag
// //     if (
// //       paymentStatus === "succeeded" &&
// //       transaction.chatId &&
// //       transaction.userId
// //     ) {
// //       // Get user's details
// //       const user = await User.findById(transaction.userId);
// //       const userEmail = user ? user.email : "";
// //       const userName = user ? user.name || "" : "";
// //       const userMobile = user ? user.mobile || "" : "";

// //       // Find product and extract tech_pack & manufacturing_costs
// //       const product = await Product.findOne({
// //         userId: transaction.userId,
// //         chatId: transaction.chatId,
// //       });
// //       const techPack = product ? product.tech_pack : null;
// //       const manufacturingCosts = product ? product.manufacturing_costs : null;

// //       // Fire-and-forget sending payment receipt email
// //       sendPaymentReceiptEmail({
// //         userEmail,
// //         userName,
// //         userMobile,
// //         docId,
// //         techPack,
// //         manufacturingCosts,
// //       }).catch((err) => {
// //         console.error("Error sending payment emails:", err);
// //       });

// //       // Update user's chat message Payments_For_ManufacturerFind flag
// //       await User.updateOne(
// //         { _id: transaction.userId, "chat._id": transaction.chatId },
// //         {
// //           $set: {
// //             "chat.$.Payments_For_ManufacturerFind": true,
// //           },
// //         }
// //       );
// //     }

// //     // Trigger lead transactions processing asynchronously, do not await
// //     processLeadTransactions().catch((err) => {
// //       console.error("Error processing lead transactions:", err);
// //     });

// //     res.status(200).json({ message: "Webhook processed successfully" });
// //   } catch (error) {
// //     console.error("Error processing Zoho payment webhook:", error);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // };

// export const centralizedWebhookController = async (req, res) => {
//   try {
//     const event = req.body;

//     // Safely extract payment metadata
//     const payment = event.event_object?.payment;
//     if (!payment) {
//       return res.status(400).json({ error: "Missing payment object in webhook." });
//     }
//     const metaData = payment.meta_data || [];
//     const paymentCategory = metaData.find(md => md.key === 'payment_category')?.value;

//     // Route by payment_category
//     switch (paymentCategory) {
//       case 'manufacturer_find_payment':
//         {
//           const result = await handleManufacturerFindPaymentWebhook(event);
//           return res.status(result.status).json(result.body);
//         }

//       case 'lead_quoting_payment':
//         {
//           const result = await handleLeadQuotingPaymentWebhook(event);
//           return res.status(result.status).json(result.body);
//         }

//       default:
//         console.log(`⏭️ Webhook ignored - unknown payment_category: ${paymentCategory}`);
//         return res.status(400).json({ error: `Unknown payment_category: ${paymentCategory}` });
//     }
//   } catch (error) {
//     console.error("❌ centralizedWebhookController error:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// export async function handleManufacturerFindPaymentWebhook(event) {
//   try {
//     // Extract payment object from nested event_object
//     const payment = event.event_object?.payment;
//     if (!payment) {
//       return { status: 400, body: { error: "Missing payment object in webhook" } };
//     }

//     // Extract doc_id from meta_data array
//     const metaData = payment.meta_data || [];
//     const docIdEntry = metaData.find((item) => item.key === "doc_id");
//     if (!docIdEntry || !docIdEntry.value) {
//       return { status: 400, body: { error: "Missing doc_id in meta_data" } };
//     }
//     const docId = docIdEntry.value;

//     // Extract fields for update
//     const paymentId = payment.payment_id || "";
//     const paymentCreatedTime = payment.date || null;
//     const paymentStatus = (payment.status || "unknown").toLowerCase();

//     // Find the transaction document by ID
//     const transaction = await ManufacturerFindTransaction.findById(docId);
//     if (!transaction) {
//       return { status: 404, body: { error: "Transaction document not found" } };
//     }

//     // Update transaction fields
//     transaction.payment_id = paymentId;
//     transaction.status = paymentStatus;
//     transaction.payment_created_time = paymentCreatedTime;
//     transaction.updatedAt = new Date();
//     await transaction.save();

//     // For successful payments: send receipt and update user chat flag
//     if (
//       paymentStatus === "succeeded" &&
//       transaction.chatId &&
//       transaction.userId
//     ) {
//       // Get user's details
//       const user = await User.findById(transaction.userId);
//       const userEmail = user ? user.email : "";
//       const userName = user ? user.name || "" : "";
//       const userMobile = user ? user.mobile || "" : "";

//       // Find product and extract tech_pack & manufacturing_costs
//       const product = await Product.findOne({
//         userId: transaction.userId,
//         chatId: transaction.chatId,
//       });
//       const techPack = product ? product.tech_pack : null;
//       const manufacturingCosts = product ? product.manufacturing_costs : null;

//       // Fire-and-forget sending payment receipt email
//       sendPaymentReceiptEmail({
//         userEmail,
//         userName,
//         userMobile,
//         docId,
//         techPack,
//         manufacturingCosts,
//       }).catch((err) => {
//         console.error("Error sending payment emails:", err);
//       });

//       // Update user's chat message Payments_For_ManufacturerFind flag
//       await User.updateOne(
//         { _id: transaction.userId, "chat._id": transaction.chatId },
//         {
//           $set: {
//             "chat.$.Payments_For_ManufacturerFind": true,
//           },
//         }
//       );
//     }

//     // Trigger lead transactions processing asynchronously, do not await
//     processLeadTransactions().catch((err) => {
//       console.error("Error processing lead transactions:", err);
//     });

//     return { status: 200, body: { message: "Webhook processed successfully" } };
//   } catch (error) {
//     console.error("Error processing manufacturer_find_payment webhook:", error);
//     return { status: 500, body: { error: "Internal server error" } };
//   }
// }

// export const getManufacturerFindTransactions = async (req, res) => {
//   try {
//     const page = Number(req.query.page) || 1; // 1-based, default page 1
//     const sortOrder = req.query.sort === "desc" ? -1 : 1;
//     const limit = 10;
//     const skip = (page - 1) * limit;

//     // Only fetch fields needed
//     const transactions = await ManufacturerFindTransaction.find(
//       {},
//       "_id status amount"
//     )
//       .sort({ createdAt: sortOrder })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     // Total docs for numbering
//     const totalDocs = await ManufacturerFindTransaction.countDocuments();

//     // Add serial numbers
//     const numbered = transactions.map((doc, idx) => ({
//       serialNumber: skip + idx + 1, // e.g. page 2 starts at 11
//       doc_id: doc._id,
//       status: doc.status,
//       amount: doc.amount,
//     }));

//     res.json({
//       page,
//       totalDocs,
//       results: numbered,
//     });
//   } catch (err) {
//     console.error("Get ManufacturerFindTransactions error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const getManufacturerFindTransactionById = async (req, res) => {
//   try {
//     const { doc_id } = req.params; // expects doc_id param in route

//     const doc = await ManufacturerFindTransaction.findById(doc_id);
//     if (!doc) {
//       return res.status(404).json({ error: "Document not found" });
//     }

//     res.json(doc);
//   } catch (error) {
//     console.error("Get ManufacturerFindTransaction by ID error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


import axios from "axios";
import User from "../models/User.js";
import ManufacturerFindTransaction from "../models/ManufacturerFindTransaction.js";
import ZohoOauthToken from "../models/ZohoOauthToken.js";
import sendPaymentReceiptEmail from "../utils/sendPaymentReceiptEmail.js";
import Product from "../models/product.js";
import processLeadTransactions from "../utils/processLeadTransactions.js";
import { handleLeadQuotingPaymentWebhook } from "../automation-files/controllers/leadPaymentsController.js";
import LeadQueue from "../models/LeadQueueModel.js";

const PAYMENT_KEYS = JSON.parse(
  process.env.PAYMENT_KEYS || {
    basic_plan_99: Number(process.env.basic_plan_99 || 99),
    standard_plan_999: Number(process.env.standard_plan_999 || 999),
    lead_test_plan: Number(process.env.lead_test_plan || 1),
  }
);
// const ZOHO_ACCOUNT_ID = process.env.ZOHO_ACCOUNT_ID || "";
// const ZOHO_API_TOKEN = process.env.ZOHO_API_TOKEN || "";

export const oauthCallbackController = async (req, res) => {
  const authorizationCode = req.query.code;
  console.log("Received authorization code:", authorizationCode);

  if (!authorizationCode) {
    console.error("Authorization code is missing");
    return res.status(400).send("Authorization code is missing");
  }

  try {
    const tokenResponse = await axios.post(
      "https://accounts.zoho.in/oauth/v2/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          redirect_uri: process.env.ZOHO_REDIRECT_URI,
          code: authorizationCode,
        },
      }
    );

    console.log("Token response data:", tokenResponse.data);

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    console.log("Access Token:", access_token);
    console.log("Refresh Token:", refresh_token);
    console.log("Expires In:", expires_in);

    const expiresAt = new Date(Date.now() + expires_in * 1000);
    console.log("Calculated token expiry time:", expiresAt);

    const existingTokenDoc = await ZohoOauthToken.findOne({});
    console.log("Existing token document:", existingTokenDoc);

    const newRefreshToken =
      refresh_token ||
      (existingTokenDoc ? existingTokenDoc.refreshToken : null);
    console.log("Final refresh token to save:", newRefreshToken);

    const savedTokenDoc = await ZohoOauthToken.findOneAndUpdate(
      {},
      {
        accessToken: access_token,
        refreshToken: newRefreshToken,
        expiresAt: expiresAt,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log("Saved token document:", savedTokenDoc);

    res.send("Authorization successful. You can close this window.");
  } catch (error) {
    console.error(
      "OAuth token exchange failed:",
      error.response?.data || error.message
    );
    res.status(500).send("Token exchange failed");
  }
};

export async function getValidZohoAccessToken() {
  const tokenDoc = await ZohoOauthToken.findOne({});
  if (!tokenDoc) {
    throw new Error("No OAuth tokens found; please authorize first.");
  }

  const now = new Date();
  let accessToken = tokenDoc.accessToken;

  // Refresh if expired or near expiry (<1 min)
  if (tokenDoc.expiresAt <= now || tokenDoc.expiresAt - now < 60000) {
    const refreshResponse = await axios.post(
      "https://accounts.zoho.in/oauth/v2/token",
      null,
      {
        params: {
          refresh_token: tokenDoc.refreshToken,
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          grant_type: "refresh_token",
        },
      }
    );
    accessToken = refreshResponse.data.access_token;
    tokenDoc.accessToken = accessToken;
    tokenDoc.expiresAt = new Date(
      Date.now() + refreshResponse.data.expires_in * 1000
    );
    await tokenDoc.save();
  }

  return accessToken;
}

export const createPaymentSessionController = async (req, res) => {
  const { userId, chatId, planKey, description, currency = "INR" } = req.body;

  if (!userId || !chatId || !planKey) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Get amount from PAYMENT_KEYS using planKey
    const amount = PAYMENT_KEYS[planKey];
    if (!amount) {
      return res.status(400).json({ error: `Invalid planKey: ${planKey}` });
    }

    // Create a new ManufacturerFindTransaction document
    const newTransaction = new ManufacturerFindTransaction({
      userId,
      chatId,
      description,
      currency,
      amount,
      status: "pending",
      session_created_time: Math.floor(Date.now() / 1000), // current unix timestamp (seconds)
    });

    await newTransaction.save();

    // Prepare Zoho payment session payload
    const metaData = [
      { key: "doc_id", value: newTransaction._id.toString() },
      { key: "user_id", value: userId },
      { key: "chat_id", value: chatId },
      { key: "payment_category", value: "manufacturer_find_payment" },
    ];

    const payload = {
      amount,
      currency,
      meta_data: metaData,
      description,
      invoice_number: `INV-${newTransaction._id.toString().slice(-6)}`, // example invoice number
    };

    // Get access token from your token handling (assumed helper function)
    const accessToken = await getValidZohoAccessToken();

    // Call Zoho Payments API to create payment session
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
      return res.status(500).json({ error: "Payment session creation failed" });
    }

    newTransaction.payments_session_id = paymentSession.payments_session_id;
    newTransaction.message = zohoResponse.data.message || "success";
    newTransaction.session_created_time = paymentSession.created_time;
    newTransaction.updatedAt = new Date();

    await newTransaction.save();

    // Update user's transactions array
    await User.findByIdAndUpdate(userId, {
      $push: {
        transactions: {
          ManufacturerFind_collectionId: newTransaction._id,
          payments_session_id: paymentSession.payments_session_id,
          chatId: chatId,
          createdAt: new Date(),
        },
      },
    });

    // Send relevant details to frontend
    res.json({
      payments_session_id: paymentSession.payments_session_id,
      amount: paymentSession.amount,
      currency: paymentSession.currency,
      description: paymentSession.description,
      invoice_number: paymentSession.invoice_number,
      doc_id: newTransaction._id,
      userId,
      chatId,
    });
  } catch (error) {
    console.error("Error createPaymentSessionController:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const zohoPaymentWebhookController = async (req, res) => {
//   try {
//     const event = req.body;

//     // Extract payment object from nested event_object
//     const payment = event.event_object?.payment;
//     if (!payment) {
//       return res.status(400).json({ error: "Missing payment object in webhook" });
//     }

//     // Extract doc_id from meta_data array
//     const metaData = payment.meta_data || [];
//     const docIdEntry = metaData.find((item) => item.key === "doc_id");
//     if (!docIdEntry || !docIdEntry.value) {
//       return res.status(400).json({ error: "Missing doc_id in meta_data" });
//     }
//     const docId = docIdEntry.value;

//     // Extract fields for update
//     const paymentId = payment.payment_id || "";
//     const paymentCreatedTime = payment.date || null;
//     const paymentStatus = (payment.status || "unknown").toLowerCase();

//     // Find the transaction document by ID
//     const transaction = await ManufacturerFindTransaction.findById(docId);
//     if (!transaction) {
//       return res.status(404).json({ error: "Transaction document not found" });
//     }

//     // Update transaction fields
//     transaction.payment_id = paymentId;
//     transaction.status = paymentStatus;
//     transaction.payment_created_time = paymentCreatedTime;
//     transaction.updatedAt = new Date();
//     await transaction.save();

//     // For successful payments: send receipt and update user chat flag
//     if (
//       paymentStatus === "succeeded" &&
//       transaction.chatId &&
//       transaction.userId
//     ) {
//       // Get user's details
//       const user = await User.findById(transaction.userId);
//       const userEmail = user ? user.email : "";
//       const userName = user ? user.name || "" : "";
//       const userMobile = user ? user.mobile || "" : "";

//       // Find product and extract tech_pack & manufacturing_costs
//       const product = await Product.findOne({
//         userId: transaction.userId,
//         chatId: transaction.chatId,
//       });
//       const techPack = product ? product.tech_pack : null;
//       const manufacturingCosts = product ? product.manufacturing_costs : null;

//       // Fire-and-forget sending payment receipt email
//       sendPaymentReceiptEmail({
//         userEmail,
//         userName,
//         userMobile,
//         docId,
//         techPack,
//         manufacturingCosts,
//       }).catch((err) => {
//         console.error("Error sending payment emails:", err);
//       });

//       // Update user's chat message Payments_For_ManufacturerFind flag
//       await User.updateOne(
//         { _id: transaction.userId, "chat._id": transaction.chatId },
//         {
//           $set: {
//             "chat.$.Payments_For_ManufacturerFind": true,
//           },
//         }
//       );
//     }

//     // Trigger lead transactions processing asynchronously, do not await
//     processLeadTransactions().catch((err) => {
//       console.error("Error processing lead transactions:", err);
//     });

//     res.status(200).json({ message: "Webhook processed successfully" });
//   } catch (error) {
//     console.error("Error processing Zoho payment webhook:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const centralizedWebhookController = async (req, res) => {
  try {
    const event = req.body;

    // Safely extract payment metadata
    const payment = event.event_object?.payment;
    if (!payment) {
      return res
        .status(400)
        .json({ error: "Missing payment object in webhook." });
    }
    const metaData = payment.meta_data || [];
    const paymentCategory = metaData.find(
      (md) => md.key === "payment_category"
    )?.value;

    // Route by payment_category
    switch (paymentCategory) {
      case "manufacturer_find_payment": {
        const result = await handleManufacturerFindPaymentWebhook(event);
        return res.status(result.status).json(result.body);
      }

      case "lead_quoting_payment": {
        const result = await handleLeadQuotingPaymentWebhook(event);
        return res.status(result.status).json(result.body);
      }

      default:
        console.log(
          `⏭️ Webhook ignored - unknown payment_category: ${paymentCategory}`
        );
        return res
          .status(400)
          .json({ error: `Unknown payment_category: ${paymentCategory}` });
    }
  } catch (error) {
    console.error("❌ centralizedWebhookController error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export async function handleManufacturerFindPaymentWebhook(event) {
  try {
    // Extract payment object from nested event_object
    const payment = event.event_object?.payment;
    if (!payment) {
      return {
        status: 400,
        body: { error: "Missing payment object in webhook" },
      };
    }

    // Extract doc_id from meta_data array
    const metaData = payment.meta_data || [];
    const docIdEntry = metaData.find((item) => item.key === "doc_id");
    if (!docIdEntry || !docIdEntry.value) {
      return { status: 400, body: { error: "Missing doc_id in meta_data" } };
    }
    const docId = docIdEntry.value;

    // Extract fields for update
    const paymentId = payment.payment_id || "";
    const paymentCreatedTime = payment.date || null;
    const paymentStatus = (payment.status || "unknown").toLowerCase();

    // Find the transaction document by ID
    const transaction = await ManufacturerFindTransaction.findById(docId);
    if (!transaction) {
      return { status: 404, body: { error: "Transaction document not found" } };
    }

    // Update transaction fields
    transaction.payment_id = paymentId;
    transaction.status = paymentStatus;
    transaction.payment_created_time = paymentCreatedTime;
    transaction.updatedAt = new Date();
    await transaction.save();

    // For successful payments: send receipt and update user chat flag
    if (
      paymentStatus === "succeeded" &&
      transaction.chatId &&
      transaction.userId
    ) {
      // Get user's details
      const user = await User.findById(transaction.userId);
      const userEmail = user ? user.email : "";
      const userName = user ? user.name || "" : "";
      const userMobile = user ? user.mobile || "" : "";

      // Find product and extract tech_pack & manufacturing_costs
      const product = await Product.findOne({
        userId: transaction.userId,
        chatId: transaction.chatId,
      });
      const techPack = product ? product.tech_pack : null;
      const manufacturingCosts = product ? product.manufacturing_costs : null;

      // Fire-and-forget sending payment receipt email
      sendPaymentReceiptEmail({
        userEmail,
        userName,
        userMobile,
        docId,
        techPack,
        manufacturingCosts,
      }).catch((err) => {
        console.error("Error sending payment emails:", err);
      });

      // Update user's chat message Payments_For_ManufacturerFind flag
      await User.updateOne(
        { _id: transaction.userId, "chat._id": transaction.chatId },
        {
          $set: {
            "chat.$.Payments_For_ManufacturerFind": true,
          },
        }
      );

      //Updat LeadQueue
      await LeadQueue.create({ doc_id: docId });
    }

    // Trigger lead transactions processing asynchronously, do not await
    processLeadTransactions().catch((err) => {
      console.error("Error processing lead transactions:", err);
    });

    return { status: 200, body: { message: "Webhook processed successfully" } };
  } catch (error) {
    console.error("Error processing manufacturer_find_payment webhook:", error);
    return { status: 500, body: { error: "Internal server error" } };
  }
}

export const getManufacturerFindTransactions = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1; // 1-based, default page 1
    const sortOrder = req.query.sort === "desc" ? -1 : 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Only fetch fields needed
    const transactions = await ManufacturerFindTransaction.find(
      {},
      "_id status amount"
    )
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Total docs for numbering
    const totalDocs = await ManufacturerFindTransaction.countDocuments();

    // Add serial numbers
    const numbered = transactions.map((doc, idx) => ({
      serialNumber: skip + idx + 1, // e.g. page 2 starts at 11
      doc_id: doc._id,
      status: doc.status,
      amount: doc.amount,
    }));

    res.json({
      page,
      totalDocs,
      results: numbered,
    });
  } catch (err) {
    console.error("Get ManufacturerFindTransactions error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getManufacturerFindTransactionById = async (req, res) => {
  try {
    const { doc_id } = req.params; // expects doc_id param in route

    const doc = await ManufacturerFindTransaction.findById(doc_id);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(doc);
  } catch (error) {
    console.error("Get ManufacturerFindTransaction by ID error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
