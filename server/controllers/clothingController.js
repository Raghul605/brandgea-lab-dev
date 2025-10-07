// import uploadImages from "../utils/s3Upload.js";
// import sendEmails from "../utils/sendEmails.js";
// import OpenAI from "openai";
// import Product from "../models/product.js";
// import User from "../models/User.js";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// const ProfitMarginIndia = Number(process.env.Profit_Marg_India) || 2;
// const ProfitMarginUS = Number(process.env.Profit_Marg_US) || 4;
// const conversionRate = Number(process.env.Conversion_Rate_USD) || 0.012;

// function convertINRtoUSD(inrAmount) {
//   return +(inrAmount * conversionRate).toFixed(2);
// }

// function adjustManufacturingCosts(costs, country) {
//   const adjustedCosts = {};
//   if (country.toLowerCase() === "india") {
//     for (const qty in costs) {
//       adjustedCosts[qty] = +(costs[qty] * ProfitMarginIndia).toFixed(2);
//     }
//     adjustedCosts.currency = "INR";
//   } else {
//     for (const qty in costs) {
//       adjustedCosts[qty] = convertINRtoUSD(costs[qty] * ProfitMarginUS);
//     }
//     adjustedCosts.currency = "USD";
//   }
//   return adjustedCosts;
// }

// // Unified prompt with clear instructions to avoid repeated questions and respect given country
// function getUnifiedPrompt(country) {
//   return `
// You are an apparel analyst assistant.
// Your job is to guide the user step-by-step to build a complete tech pack for a garment and then generate manufacturing costs.

// ALLOWED OUTPUT FORMATS:
// 1) Question step (for missing field):
// {
//   "question": "the single question you want to ask the user, with example options"
// }

// 2) Final JSON response (ONLY after the user confirms the Tech Pack summary is correct):
// {
//   "tech_pack": {
//     "garment_type": string,
//     "material": string,
//     "gsm": number,
//     "color": [string],
//     "design": [ { "placement": string, "type": string } ],
//     "tech": string,
//     "wash_treatments": [string],
//     "complexity_class": "basic" | "standard" | "complex",
//     "additional_comments": string
//   },
//   "manufacturing_costs": {
//     "50": number,
//     "100": number,
//     "250": number,
//     "1000": number,
//     "currency": "INR"
//   },
//   "heading": string,
//   "match": true
// }

// REQUIRED FIELDS:
// - garment_type
// - material
// - gsm
// - color (ask only if none is provided; if at least one color is given, do not ask again)
// - design (must include both placement and type)
// - tech
// - wash_treatments

// QUESTION LOGIC:
// - Ask ONE missing field at a time.
// - Each question must include 2–4 simple example options to guide the user.
//   - Example: "What type of garment is this? (e.g., T-shirt, hoodie, sweatshirt, pants)"
// - If the user provides multiple fields in one reply, capture them all and SKIP asking those again.
// - If the user says “I don’t know”, assign a sensible default and move to the next field.

// INTERNAL-ONLY FIELDS (NEVER ASK):
// - complexity_class
// - additional_comments
// You must infer and fill these internally from the product details.

// DEFAULTING RULES:
// - If “I don’t know” → fill with reasonable defaults.
// - If “no design” or “plain” → set "design" as empty array in final JSON and reflect that in summary.
// - Currency → INR by default unless user is clearly not in India.

// SUMMARY & CONFIRMATION:
// - When all required fields are available (via input or defaults), output a Tech Pack Summary in plain text (NOT JSON).
// - Expand shorthand like “standard” into full, professional descriptions.
// - End with: "Are these details correct? Do you want me to generate a estimate for this product?"

// FINAL JSON:
// - ONLY output the final JSON object after positive confirmation (yes/ok/proceed).
// - No extra text before or after.

// STRICT CONSTRAINTS:
// - During data collection → output ONLY the JSON question object.
// - During confirmation → output ONLY the Tech Pack Summary (plain text).
// - After confirmation → output ONLY the Final JSON.

// `;
// }

// async function callOpenAIChat(messages) {
//   const response = await openai.chat.completions.create({
//     model: "gpt-4.1-mini",
//     messages,
//     temperature: 0.0,
//     response_format: { type: "json_object" },
//   });

//   if (!response.choices || !response.choices[0]?.message?.content) {
//     throw new Error("OpenAI response invalid");
//   }

//   return JSON.parse(response.choices[0].message.content);
// }

// export const validateClothing = async (req, res) => {
//   try {
//     const { prompt, country, chatId, userId } = req.body;
//     const images = req.files || [];

//     if (!prompt || !userId || !country || !chatId) {
//       return res.status(400).json({
//         error: "prompt, userId, country, and chatId are required",
//       });
//     }

//     if (images.length > 2) {
//       return res.status(400).json({
//         error: "You can upload a maximum of 2 images.",
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const chat = user.chat.id(chatId);
//     if (!chat) {
//       return res.status(404).json({ error: "Chat session not found." });
//     }

//     if (chat.isCompleted) {
//       return res.status(400).json({ error: "Chat session already completed." });
//     }

//     // Append user message
//     chat.messages.push({
//       sender: "user",
//       content: { text: prompt, imageUrls: [] },
//       timestamp: new Date(),
//     });

//     // Prepare prior conversation messages for GPT
//     const priorMessages = chat.messages.map((msg) => {
//       let contentText = "";
//       if (typeof msg.content === "string") {
//         contentText = msg.content;
//       } else if (msg.content && msg.content.text) {
//         contentText = msg.content.text;
//       } else {
//         contentText = JSON.stringify(msg.content);
//       }
//       return {
//         role: msg.sender === "user" ? "user" : "assistant",
//         content: contentText,
//       };
//     });

//     const systemPrompt = getUnifiedPrompt(country);

//     // Prepare images payload
//     const imagePayloads = images.map((img) => ({
//       type: "image_url",
//       image_url: {
//         url: `data:${img.mimetype};base64,${img.buffer.toString("base64")}`,
//       },
//     }));

//     const recentMessages = priorMessages.slice(0, priorMessages.length - 1);
//     recentMessages.push({
//       role: "user",
//       content: [{ type: "text", text: prompt }, ...imagePayloads],
//     });

//     const gptMessages = [
//       { role: "system", content: systemPrompt },
//       ...recentMessages,
//     ];

//     const gptResponse = await callOpenAIChat(gptMessages);

//     if (gptResponse.error || gptResponse.match === false) {
//       const code =
//         gptResponse.reason || gptResponse.error || "validation_failed";
//       const messages = {
//         invalid_image_count: "Please attach 1–2 product reference images.",
//         image_not_clothing:
//           "The uploaded image doesn’t look like a clothing item.",
//         text_not_clothing:
//           "Your description doesn’t look like a clothing item.",
//         garment_type_mismatch:
//           "Your text and images don’t match. Please update either the text or the images.",
//       };

//       chat.messages.push({
//         sender: "gpt",
//         content: { text: messages[code] || "Validation failed." },
//         timestamp: new Date(),
//         isFinal: false,
//       });

//       await user.save();

//       return res
//         .status(400)
//         .json({ code, message: messages[code] || "Validation failed." });
//     }

//     // Upload images if any
//     const imageUrls = images.length > 0 ? await uploadImages(images) : [];
//     if (imageUrls.length > 0) {
//       chat.messages[chat.messages.length - 1].content.imageUrls = imageUrls;
//     }

//     // Save GPT response as new message
//     chat.messages.push({
//       sender: "gpt",
//       content: gptResponse,
//       timestamp: new Date(),
//       isFinal: false,
//     });

//     // Force currency to match country in GPT output manufacturing_costs
//     if (gptResponse.manufacturing_costs) {
//       gptResponse.manufacturing_costs.currency =
//         country.toLowerCase() === "india" ? "INR" : "USD";
//     }

//     // Adjust costs with profit margin and conversion
//     const originalCosts = gptResponse.manufacturing_costs || {};
//     const updatedCosts = adjustManufacturingCosts(originalCosts, country);

//     // Mark chat completed if final valid result
//     const isFinalAnswer =
//       gptResponse.tech_pack && originalCosts && !gptResponse.error;
//     if (isFinalAnswer) {
//       chat.isCompleted = true;
//       chat.messages[chat.messages.length - 1].isFinal = true;
//       chat.manufacturing_costs = updatedCosts;
//       chat.heading = gptResponse.heading || chat.heading;
//     }

//     await user.save();

//     // Create product if complete
//     if (isFinalAnswer) {
//       const profitMargin =
//         country.toLowerCase() === "india" ? ProfitMarginIndia : ProfitMarginUS;
//       await Product.create({
//         user_id: userId,
//         chat_id: chatId,
//         tech_pack: gptResponse.tech_pack,
//         manufacturing_costs: originalCosts,
//         profit_margin: profitMargin,
//         country,
//         conversion_rate: conversionRate,
//         cost_with_profit: updatedCosts,
//         heading: gptResponse.heading || chat.heading,
//       });

//       // Send emails
//       sendEmails(
//         userId,
//         originalCosts,
//         updatedCosts,
//         gptResponse.heading || chat.heading,
//         gptResponse.tech_pack,
//         images,
//         profitMargin,
//         country,
//         chatId
//       );
//     }

//     // Reply
//     return res.json({
//       manufacturing_costs: updatedCosts,
//       tech_pack: gptResponse.tech_pack,
//       imageUrls,
//       chatId,
//       heading: gptResponse.heading || chat.heading,
//       isCompleted: chat.isCompleted,
//       gptResponse,
//     });
//   } catch (err) {
//     console.error("validateClothing error:", err);
//     return res.status(500).json({ error: "Internal server error." });
//   }
// };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// Two Prompt

// import uploadImages from "../utils/s3Upload.js";
// import sendEmails from "../utils/sendEmails.js";
// import OpenAI from "openai";
// import Product from "../models/product.js";
// import User from "../models/User.js";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// const ProfitMarginIndia = Number(process.env.Profit_Marg_India) || 2;
// const ProfitMarginUS = Number(process.env.Profit_Marg_US) || 4;
// const conversionRate = Number(process.env.Conversion_Rate_USD) || 0.012;

// function convertINRtoUSD(inrAmount) {
//   return +(inrAmount * conversionRate).toFixed(2);
// }

// function adjustManufacturingCosts(costs, country) {
//   const adjustedCosts = {};
//   if (country.toLowerCase() === "india") {
//     for (const qty in costs) {
//       adjustedCosts[qty] = +(costs[qty] * ProfitMarginIndia).toFixed(2);
//     }
//     adjustedCosts.currency = "INR";
//   } else {
//     for (const qty in costs) {
//       adjustedCosts[qty] = convertINRtoUSD(costs[qty] * ProfitMarginUS);
//     }
//     adjustedCosts.currency = "USD";
//   }
//   return adjustedCosts;
// }

// // Updated Initial Prompt: For first message, gathering all required data + manufacture costs when complete
// function getInitialPrompt(country) {
//   return `
// You are an apparel analyst assistant.
// Your ONLY job is to collect all required garment details, ONE missing field at a time, then produce a summary for user confirmation.

// ### HARD RULES (ENFORCED)
// - Do NOT explain or define terms (e.g., "what is acid wash?") or answer any off-topic questions.
// - If the user asks anything unrelated to providing specs, IGNORE the content and instead ask for the NEXT missing field (or re-ask the same one if still missing).
// - Return ONLY the allowed JSON below.

// ### RETURN FORMAT (STRICT)
// Return exactly ONE of:

// 1) Missing data remains:
// {
//   "question": "Ask ONE concise question about exactly ONE missing field, include 2–4 example options."
// }

// 2) All data collected (from user input + sensible defaults):
// {
//   "summary": "Plain-language Tech Pack summary ending with: 'Are these details correct? Do you want me to generate an estimate for this product?'",
//   "draft_tech_pack": {
//     "garment_type": string,
//     "material": string,
//     "gsm": number,
//     "color": [string],
//     "design": [ { "placement": string, "type": string } ],
//     "tech": string,
//     "wash_treatments": [string],
//     "complexity_class": "basic" | "standard" | "complex",
//     "additional_comments": string
//   }
// }

// ### REQUIRED FIELDS
// - garment_type
// - material
// - gsm
// - color (ask only if none provided; if at least one color is given, do not ask again)
// - design (placement + type). If user says "no design"/"plain", set "design": []
// - tech
// - wash_treatments

// ### RULES
// - Ask ONE missing field per turn (single question).
// - Include 2–4 example options in the question.
// - If the user gives multiple fields in one reply, capture all and don’t ask them again.
// - If the user says “I don’t know”, choose reasonable defaults and proceed.
// - Infer "complexity_class" and "additional_comments" internally (never ask).
// - Assume currency is "INR" for ${country}.
// - All responses MUST be valid JSON and contain ONLY the keys shown above (either "question" or "summary" + "draft_tech_pack").
// `;
// }

// // Updated Follow-up Prompt: For subsequent messages to collect missing info or answer clarifications
// function getFollowUpPrompt(country, techPack) {
//   return `
// You are an apparel cost estimator. The user has CONFIRMED the following tech pack:

// ${JSON.stringify(techPack)}

// ### RETURN FORMAT (STRICT)
// Return ONLY the Final JSON object (no extra text/keys):

// {
//   "tech_pack": {
//     "garment_type": string,
//     "material": string,
//     "gsm": number,
//     "color": [string],
//     "design": [ { "placement": string, "type": string } ],
//     "tech": string,
//     "wash_treatments": [string],
//     "complexity_class": "basic" | "standard" | "complex",
//     "additional_comments": string
//   },
//   "manufacturing_costs": {
//     "50": number,
//     "100": number,
//     "250": number,
//     "1000": number,
//     "currency": "${country.toLowerCase() === "india" ? "INR" : "USD"}"
//   },
//   "heading": "String",
//   "match": true
// }

// ### RULES
// - Prices are per-piece tiered costs for quantities 50, 100, 250, 1000.
// - DO NOT include component-level keys (no fabric_cost_per_meter, etc.).
// - All numbers should be realistic and internally consistent.
// - Respond with ONLY the JSON above.
// `;
// }

// function getHeadingPrompt(techPack) {
//   return `
// Based on the following apparel tech pack details, generate a concise descriptive chat heading title (2-5 words):

// ${JSON.stringify(techPack)}

// Return only the heading text.
// `;
// }

// async function callOpenAIChat(messages, model = "gpt-4.1-nano") {
//   const response = await openai.chat.completions.create({
//     model,
//     messages,
//     temperature: 0.0,
//     response_format: { type: "json_object" },
//   });

//   if (!response.choices || !response.choices[0]?.message?.content) {
//     throw new Error("OpenAI response invalid");
//   }

//   return JSON.parse(response.choices[0].message.content);
// }

// export const validateClothing = async (req, res) => {
//   try {
//     const { prompt, country, chatId, userId } = req.body;
//     const images = req.files || [];

//     if (!prompt || !userId || !country || !chatId) {
//       return res.status(400).json({
//         error: "prompt, userId, country, and chatId are required",
//       });
//     }

//     if (images.length > 2) {
//       return res.status(400).json({
//         error: "You can upload a maximum of 2 images.",
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const chat = user.chat.id(chatId);
//     if (!chat) {
//       return res.status(404).json({ error: "Chat session not found." });
//     }

//     if (chat.isCompleted) {
//       return res.status(400).json({ error: "Chat session already completed." });
//     }

//     // Append user message to chat
//     chat.messages.push({
//       sender: "user",
//       content: { text: prompt, imageUrls: [] },
//       timestamp: new Date(),
//     });

//     // Prepare prior conversation messages for GPT (including text only for simplicity)
//     const priorMessages = chat.messages.map((msg) => {
//       // If content is object, convert to string; if text exists, use text
//       let contentText = "";
//       if (typeof msg.content === "string") {
//         contentText = msg.content;
//       } else if (msg.content && msg.content.text) {
//         contentText = msg.content.text;
//       } else {
//         contentText = JSON.stringify(msg.content);
//       }

//       return {
//         role: msg.sender === "user" ? "user" : "assistant",
//         content: contentText,
//       };
//     });

//     // Find the latest tech pack from previous messages
//     let techPack = null;
//     for (let i = chat.messages.length - 1; i >= 0; i--) {
//       const msg = chat.messages[i];
//       if (msg.sender === "gpt" && msg.content && msg.content.draft_tech_pack) {
//         techPack = msg.content.draft_tech_pack || msg.content.tech_pack;
//         break;
//       }
//     }

//     // Select prompt based on chat progress
//     const isFirstMessage = chat.messages.length === 1;
//     // only current user message so far
//     let systemPrompt;
//     if (isFirstMessage || !techPack) {
//       systemPrompt = getInitialPrompt(country);
//     } else {
//       systemPrompt = getFollowUpPrompt(country, techPack);
//     }

//     // Prepare GPT message payload including images (base64)
//     const imagePayloads = images.map((img) => ({
//       type: "image_url",
//       image_url: {
//         url: `data:${img.mimetype};base64,${img.buffer.toString("base64")}`,
//       },
//     }));

//     // Compose messages for GPT with system prompt first, then conversation history + current user message
//     // We remove the last user message from priorMessages as we will add it again at the end with images
//     const recentMessages = priorMessages.slice(0, priorMessages.length - 1);
//     recentMessages.push({
//       role: "user",
//       content: [{ type: "text", text: prompt }, ...imagePayloads],
//     });

//     const gptMessages = [
//       { role: "system", content: systemPrompt },
//       ...recentMessages,
//     ];

//     // Select model: mini if images present, else nano
//     const modelToUse = images.length > 0 ? "gpt-4.1-mini" : "gpt-4.1-nano";

//     // Call OpenAI chat completion
//     const gptResponse = await callOpenAIChat(gptMessages, modelToUse);

//     // Handle error or non-match responses
//     if (gptResponse.error || gptResponse.match === false) {
//       const code =
//         gptResponse.reason || gptResponse.error || "validation_failed";
//       const messages = {
//         invalid_image_count: "Please attach 1–2 product reference images.",
//         image_not_clothing:
//           "The uploaded image doesn’t look like a clothing item.",
//         text_not_clothing:
//           "Your description doesn’t look like a clothing item.",
//         garment_type_mismatch:
//           "Your text and images don’t match. Please update either the text or the images.",
//       };

//       chat.messages.push({
//         sender: "gpt",
//         content: { text: messages[code] || "Validation failed." },
//         timestamp: new Date(),
//         isFinal: false,
//       });

//       await user.save();
//       return res
//         .status(400)
//         .json({ code, message: messages[code] || "Validation failed." });
//     }

//     // Upload images to S3 if any and update chat message content
//     const imageUrls = images.length > 0 ? await uploadImages(images) : [];

//     if (imageUrls.length > 0) {
//       // Attach URLs to the last user message in chat
//       chat.messages[chat.messages.length - 1].content.imageUrls = imageUrls;
//     }

//     // Append GPT response as new message
//     chat.messages.push({
//       sender: "gpt",
//       content: gptResponse,
//       timestamp: new Date(),
//       isFinal: false,
//     });

//     // Generate chat heading if missing or default
//     if (!chat.heading || chat.heading === "New Chat") {
//       const headingPrompt = getHeadingPrompt(
//         gptResponse.tech_pack || gptResponse.draft_tech_pack
//       );
//       const headingMessages = [
//         {
//           role: "system",
//           content: "You are a helpful assistant that generates chat titles.",
//         },
//         { role: "user", content: headingPrompt },
//       ];
//       const headingRes = await openai.chat.completions.create({
//         model: "gpt-4.1-mini",
//         messages: headingMessages,
//         temperature: 0.3,
//         max_tokens: 10,
//       });
//       chat.heading =
//         headingRes.choices[0].message.content.trim() || "Chat about Apparel";
//     }

//     const originalCosts = gptResponse.manufacturing_costs || {};
//     const updatedCosts = adjustManufacturingCosts(originalCosts, country);

//     // Mark chat completed if final structured JSON with tech_pack + costs returned
//     const isFinalAnswer =
//       gptResponse.tech_pack && originalCosts && !gptResponse.error;
//     if (isFinalAnswer) {
//       chat.isCompleted = true;
//       chat.messages[chat.messages.length - 1].isFinal = true;
//       chat.manufacturing_costs = updatedCosts;
//     }

//     await user.save();

//     // Create Product entry on final completion
//     if (isFinalAnswer) {
//       const profitMargin =
//         country.toLowerCase() === "india" ? ProfitMarginIndia : ProfitMarginUS;

//       await Product.create({
//         user_id: userId,
//         chat_id: chatId,
//         tech_pack: gptResponse.tech_pack,
//         manufacturing_costs: originalCosts,
//         profit_margin: profitMargin,
//         country,
//         conversion_rate: conversionRate,
//         cost_with_profit: updatedCosts,
//       });

//       // Send email notification
//       sendEmails(
//         userId,
//         originalCosts,
//         updatedCosts,
//         prompt,
//         gptResponse.tech_pack,
//         images,
//         profitMargin,
//         country,
//         chatId
//       );
//     }

//     // Return the response to frontend
//     return res.json({
//       manufacturing_costs: updatedCosts,
//       tech_pack: gptResponse.tech_pack,
//       imageUrls,
//       chatId,
//       heading: chat.heading,
//       isCompleted: chat.isCompleted,
//       gptResponse, // full GPT response for debugging or front-end use
//     });
//   } catch (err) {
//     console.error("validateClothing error:", err);
//     return res.status(500).json({ error: "Internal server error." });
//   }
// };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// import uploadImages from "../utils/s3Upload.js";
// import sendEmails from "../utils/sendEmails.js";
// import OpenAI from "openai";
// import Product from "../models/product.js";
// import User from "../models/User.js";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// const ProfitMarginIndia = Number(process.env.Profit_Marg_India) || 2;
// const ProfitMarginUS = Number(process.env.Profit_Marg_US) || 4;
// const conversionRate = Number(process.env.Conversion_Rate_USD) || 0.012;

// function convertINRtoUSD(inrAmount) {
//   return +(inrAmount * conversionRate).toFixed(2);
// }

// function adjustManufacturingCosts(costs, country) {
//   const adjustedCosts = {};
//   if (country.toLowerCase() === "india") {
//     for (const qty in costs) {
//       adjustedCosts[qty] = +(costs[qty] * ProfitMarginIndia).toFixed(2);
//     }
//     adjustedCosts.currency = "INR";
//   } else {
//     for (const qty in costs) {
//       const increased = costs[qty] * ProfitMarginUS;
//       adjustedCosts[qty] = convertINRtoUSD(increased);
//     }
//     adjustedCosts.currency = "USD";
//   }
//   return adjustedCosts;
// }

// async function callOpenAIGPTValidateClothing(prompt, images) {
//   const imagePayloads = images.map((img, i) => ({
//     type: "image_url",
//     image_url: {
//       url: `data:${img.mimetype};base64,${img.buffer.toString("base64")}`,
//     },
//   }));

//   const unifiedPrompt = `
// Role: apparel analyst and cost estimator. *Return JSON only.*

// 1. If image not clothing → {"error":"image_not_clothing"} (STOP)
// 2. If text not clothing → {"error":"text_not_clothing"} (STOP)

// 3. Let I = garment_type from image, T = garment_type from text (null if absent)
//    • If T && T !== I → {"match":false,"reason":"garment_type_mismatch"} (STOP)
//    • Else { "match": true, garment_type: I }

// 4. Text overrides image; otherwise infer all visible/implicit details.
// 5. Fill gaps with sensible defaults.

// 6. In "tech_pack" object, include ONLY these keys:
//    garment_type: string
//    material: string
//    gsm: number
//    color: array of strings (one or more colors)
//    Design: array of objects (one per placement) describing decoration type (e.g., print, embroidery, dtf, dtg, screen, heat_transfer, etc.)
//    tech: string, decoration method; free text (e.g., print, embroidery, dtf, dtg, screen, heat_transfer)
//    wash_treatments: array of strings (e.g., ['enzyme_wash']), or [] if none
//    complexity_class: "basic" (no zipper/lining), "standard" (typical sweatshirt/tee), or "complex" (zipper/lining/many panels)
//    additional_comments: string; anything important not covered elsewhere (e.g., special packaging, testing, unusual trims)

// 7. Estimate average manufacturing cost per piece (INR) for quantities: 50, 100, 250, 1000.
//    Consider raw material costs, bulk discounts, labor amortization, tooling setup, and typical manufacturing rates in India.
//    Respond with a "manufacturing_costs" object.

// Input
// Text: "${prompt}"
// Image: uploaded

// Return:
// {
//   "match": true,
//   "tech_pack": {
//     garment_type,
//     material,
//     gsm,
//     color,
//     Design,
//     tech,
//     wash_treatments,
//     complexity_class,
//     additional_comments
//   },
//   "manufacturing_costs": { /* costs object */ }
// }
// `;

//   const response = await openai.chat.completions.create({
//     model: "gpt-4.1-mini",
//     messages: [
//       {
//         role: "user",
//         content: [{ type: "text", text: unifiedPrompt }, ...imagePayloads],
//       },
//     ],
//     response_format: { type: "json_object" },
//     temperature: 0.0,
//     seed: 12345,
//   });

//   return JSON.parse(response.choices[0].message.content);
// }

// export const validateClothing = async (req, res) => {
//   try {
//     const { prompt, country } = req.body;
//     const userId = req.user?.userId;
//     const images = req.files;

//     if (
//       !prompt ||
//       !images ||
//       images.length === 0 ||
//       images.length > 2 ||
//       !userId ||
//       !country
//     ) {
//       return res.status(400).json({
//         error:
//           "Prompt, 1–2 images, authenticated user, and country are required.",
//       });
//     }

//     // 1. GPT call with both images and prompt
//     const gptResponse = await callOpenAIGPTValidateClothing(prompt, images);

//     if (gptResponse.error || gptResponse.match === false) {
//       const code =
//         gptResponse.reason || gptResponse.error || "validation_failed";

//       const messages = {
//         invalid_image_count: "Please attach 1–2 product reference images.",
//         image_not_clothing:
//           "The uploaded image doesn’t look like a clothing item.",
//         text_not_clothing:
//           "Your description doesn’t look like a clothing item.",
//         garment_type_mismatch:
//           "Your text and images don’t match. Please update either the text or the images.",
//       };

//       return res.status(400).json({
//         code,
//         message:
//           messages[code] ||
//           "We couldn't validate your request. Please review and try again.",
//       });
//     }

//     // 2. Upload images to S3
//     const imageUrls = await uploadImages(images); // [url1, url2]

//     // 3. User lookup
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // 4. Cost adjustments

//     const originalCosts = gptResponse.manufacturing_costs || {};
//     const updatedCosts = adjustManufacturingCosts(originalCosts, country);

//     // 5. Save chat to user
//     const chatEntry = {
//       prompt: {
//         text: prompt,
//         imageUrls: imageUrls,
//       },
//       manufacturing_costs: updatedCosts,
//     };
//     user.chat.push(chatEntry);
//     await user.save();

//     // 6. Chat id for reference
//     const newChat = user.chat[user.chat.length - 1];
//     const chat_id = newChat._id;

//     // 7. Profit margin used
//     const profitMargin =
//       country.toLowerCase() === "india"
//         ? Number(process.env.Profit_Marg_India) || 1.3
//         : Number(process.env.Profit_Marg_US) || 1.5;

//     // 8. Product creation with original costs and tech pack

//     await Product.create({
//       user_id: userId,
//       chat_id,
//       tech_pack: gptResponse.tech_pack,
//       manufacturing_costs: originalCosts,
//       profit_margin: profitMargin,
//       country,
//       conversion_rate: conversionRate,
//       cost_with_profit: updatedCosts,
//     });

//     // 9. Send emails
//     const techPack = gptResponse.tech_pack;

//     sendEmails(
//       userId,
//       originalCosts,
//       updatedCosts,
//       prompt,
//       techPack,
//       images,
//       profitMargin,
//       country,
//       chat_id
//     );

//     // 10. Response
//     return res.json({
//       manufacturing_costs: updatedCosts,
//       tech_pack: gptResponse.tech_pack,
//       imageUrls,
//     });
//   } catch (err) {
//     console.error("validateClothing error:", err);
//     return res.status(500).json({ error: "Internal server error." });
//   }
// };

/////////////////////////////////////////////////////// 3 prompt

import uploadImages from "../utils/s3Upload.js";
import sendEmails from "../utils/sendEmails.js";
import OpenAI from "openai";
import User from "../models/User.js";
import Product from "../models/Product.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ProfitMarginIndia = Number(process.env.Profit_Marg_India) || 2;
const ProfitMarginUS = Number(process.env.Profit_Marg_US) || 4;
const conversionRate = Number(process.env.Conversion_Rate_USD) || 0.012;

function convertINRtoUSD(inrAmount) {
  return +(inrAmount * conversionRate).toFixed(2);
}

function adjustManufacturingCosts(costs, country) {
  const adjusted = {};
  if (!costs) return adjusted;
  const isIN = country.toLowerCase() === "india";
  for (const k of Object.keys(costs)) {
    if (k === "currency") continue;
    const base = Number(costs[k] || 0);
    adjusted[k] = isIN
      ? +(base * ProfitMarginIndia).toFixed(2)
      : convertINRtoUSD(base * ProfitMarginUS);
  }
  adjusted.currency = isIN ? "INR" : "USD";
  return adjusted;
}

/** STRICT: never explain; ask one spec per turn; or output summary+draft. */
function getInitialPrompt(country) {
  return `
You are an apparel analyst assistant.

Objective
- Build a complete tech pack by using the full conversation + any attached images.
- Ask for exactly ONE missing spec at a time (short, friendly language).
- Never ask for specs the user already provided.

Important rules
- If the user says "plain" or "no design", set design = [] and DO NOT ask for images.
- If at least one color is already provided, do NOT ask for more colors.
- When you ask a spec question, include 2–4 simple, relatable examples.
- Use everyday words. Instead of "tech", say "fabric type/feel" (e.g., jersey, fleece, terry). If it’s a print job, say "print method" (e.g., screen print, DTF).

Required fields (must all be present to summarize):
- garment_type
- material
- gsm
- color   (array with ≥1 item)
- design  (array of { placement, type } — or [] if plain/no design)
- tech    (either the fabric type/feel OR the print method)
- wash_treatments (array; [] if none)

Embellishment rule (only if a print/embellishment is mentioned anywhere)
- If prints/embellishments are involved (e.g., “screen print”, “print”, “DTF”, “DTG”, “sublimation”, “heat transfer”, “puff”, “vinyl”, “embroidery”, “badge/patch/appliqué”) AND no reference images have been shared, ask the user to upload 1–2 reference images (JPG/PNG/WebP).
- Do NOT ask for print size; assume a sensible default internally.
- If images already exist, do NOT ask again.

Conversation style:
- Keep it natural and brief. Avoid jargon. Do not explain your process.
- If the user goes off-topic (e.g., asks definitions), gently continue collecting the next missing spec.
- If the user provides multiple specs in one message, capture all of them and do not re-ask.

What to return (STRICT JSON — exactly ONE of these)

1)  A question when something is missing (or images are needed):
{
  "question": "ONE short question about ONE missing field (or a polite request for 1–2 reference images, if prints/embellishments are mentioned and images are missing). Include 2–4 quick example options when asking for a spec."
}

2) Everything present (use defaults only if user explicitly said 'I don't know'):
{
  "summary": "Write a natural, single-paragraph recap in the user's words. End with exactly: Are these details correct? Do you want me to generate an estimate for this product?",
  "draft_tech_pack": {
    "garment_type": string,
    "material": string,
    "gsm": number,
    "color": [string],
    "design": [ { "placement": string, "type": string } ],
    "tech": string,
    "wash_treatments": [string],
    "complexity_class": "basic" | "standard" | "complex",
    "additional_comments": "1–2 short, user-facing notes about reasonable assumptions you made."
  }
}

Notes:
- Assume currency is "INR" for ${country}.
- Output MUST be valid JSON with ONLY the keys above. No extra keys or text.
`;
}

/** STRICT: confirm | edit(updated draft) | clarify(one spec question). Never explain. */
function getConfirmationOrUpdatePrompt(pendingPack) {
  return `
You are an apparel assistant. 

Here is the current DRAFT tech pack:
${JSON.stringify(pendingPack)}

Task
- Interpret the user's latest free-form reply.
- Decide if they CONFIRM, want to EDIT, or you must CLARIFY one specific point.
- Use everyday words. Avoid jargon like “tech”; say “fabric type/feel” or “print method”.

Guardrails
- If the user says "plain" or "no design", ensure design = [].
- If prints/embellishments are involved anywhere but NO reference images were ever provided, request 1–2 images now (JPG/PNG/WebP). Do not ask for print size.
- If a required field is still missing, ask ONE concise question with 2–4 simple examples.
- Stay on-topic. Ignore requests for definitions and keep moving the spec forward.

Return exactly ONE of the following JSON shapes:

1) Confirm:
{ "intent": "confirm" }

2) Edit (return the FULL updated draft_tech_pack; keep "additional_comments" as short notes you author):
{
  "intent": "edit",
  "updated_tech_pack": {
    "garment_type": string,
    "material": string,
    "gsm": number,
    "color": [string],
    "design": [ { "placement": string, "type": string } ],
    "tech": string,
    "wash_treatments": [string],
    "complexity_class": "basic" | "standard" | "complex",
    "additional_comments": "1–2 short user-facing notes reflecting the latest changes."
  }
}

3) Clarify (ONE short question, or request for images if prints are mentioned and none were shared):
{
  "intent": "clarify",
  "question": "Your one short, friendly question (or the polite image request). Include 2–4 quick examples when asking for a spec."
}

Output MUST be valid JSON with ONLY the keys above.
`;
}

function getFollowUpPrompt(country, techPack) {
  return `
You are an apparel cost estimator. The user CONFIRMED this tech pack:

${JSON.stringify(techPack)}

Return ONLY this JSON (no extra text/keys):

{
  "tech_pack": {
    "garment_type": string,
    "material": string,
    "gsm": number,
    "color": [string],
    "design": [ { "placement": string, "type": string } ],
    "tech": string,
    "wash_treatments": [string],
    "complexity_class": "basic" | "standard" | "complex",
    "additional_comments": "Keep as short, user-facing comments/notes."
  },
  "manufacturing_costs": {
    "50": number,
    "100": number,
    "250": number,
    "1000": number,
    "currency": "${country.toLowerCase() === "india" ? "INR" : "USD"}"
  },
  "heading": "String",
  "match": true
}

Rules:
- All required fields must be present (assume the confirmation stage ensured this).
- Numbers are realistic, internally consistent, and are per-piece for 50 / 100 / 250 / 1000.
- Output MUST be valid JSON with ONLY the keys above.
`;
}

function getHeadingPrompt(techPack) {
  return `
Based on this tech pack:

${JSON.stringify(techPack)}

Generate a concise, descriptive chat title (2–5 words), user-friendly (e.g., “240 GSM Terry Tee” or “Black Fleece Hoodie”). 
Return ONLY the heading text (no JSON, no quotes, no extra words).
`;
}

async function callOpenAIChat(messages, model = "gpt-4.1-nano") {
  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.0,
    response_format: { type: "json_object" },
  });

  const content = response?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI response invalid");
  return JSON.parse(content);
}
export const validateClothing = async (req, res) => {
  try {
    const { prompt, country, chatId, userId } = req.body;
    const files = req.files || [];

    if (!prompt || !userId || !country || !chatId) {
      return res
        .status(400)
        .json({ error: "prompt, userId, country, and chatId are required" });
    }
    if (files.length > 2) {
      return res
        .status(400)
        .json({ error: "You can upload a maximum of 2 images." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const chat = user.chat.id(chatId);
    if (!chat)
      return res.status(404).json({ error: "Chat session not found." });
    if (chat.isCompleted)
      return res.status(400).json({ error: "Chat session already completed." });

    // Append user message (images added later)
    chat.messages.push({
      sender: "user",
      content: { text: prompt, imageUrls: [] },
      timestamp: new Date(),
    });

    const priorMessages = chat.messages.map((m) => {
      const text =
        typeof m.content === "string"
          ? m.content
          : m.content?.text
          ? m.content.text
          : JSON.stringify(m.content);
      return {
        role: m.sender === "user" ? "user" : "assistant",
        content: text,
      };
    });

    const imagePayloads = files.map((img) => ({
      type: "image_url",
      image_url: {
        url: `data:${img.mimetype};base64,${img.buffer.toString("base64")}`,
      },
    }));

    const sendToModel = async (systemPrompt, useMini = files.length > 0) => {
      const recent = priorMessages.slice(0, priorMessages.length - 1);
      recent.push({
        role: "user",
        content: [{ type: "text", text: prompt }, ...imagePayloads],
      });
      const gptMessages = [
        { role: "system", content: systemPrompt },
        ...recent,
      ];
      const model = useMini ? "gpt-4.1-mini" : "gpt-4.1-nano";
      return callOpenAIChat(gptMessages, model);
    };

    let gptResponse = null;

    if (chat.state === "collecting") {
      gptResponse = await sendToModel(getInitialPrompt(country));
      if (gptResponse.summary && gptResponse.draft_tech_pack) {
        chat.pending_tech_pack = gptResponse.draft_tech_pack;
        chat.state = "awaiting_confirmation";
      }
    } else if (chat.state === "awaiting_confirmation") {
      const recent = priorMessages.slice(0, priorMessages.length - 1);
      recent.push({
        role: "user",
        content: [{ type: "text", text: prompt }, ...imagePayloads],
      });

      const classification = await callOpenAIChat(
        [
          {
            role: "system",
            content: getConfirmationOrUpdatePrompt(chat.pending_tech_pack),
          },
          ...recent,
        ],
        "gpt-4.1-nano"
      );

      if (classification.intent === "confirm") {
        chat.confirmed_tech_pack = chat.pending_tech_pack;
        chat.state = "confirmed";
        gptResponse = await sendToModel(
          getFollowUpPrompt(country, chat.confirmed_tech_pack)
        );
      } else if (
        classification.intent === "edit" &&
        classification.updated_tech_pack
      ) {
        chat.pending_tech_pack = classification.updated_tech_pack;
        // Seed the assistant with an updated draft so the next question/summary reflects it
        priorMessages.push({
          role: "assistant",
          content: `Updated draft: ${JSON.stringify(chat.pending_tech_pack)}`,
        });
        gptResponse = await sendToModel(getInitialPrompt(country));
        if (gptResponse.summary && gptResponse.draft_tech_pack) {
          chat.pending_tech_pack = gptResponse.draft_tech_pack;
          chat.state = "awaiting_confirmation";
        }
      } else if (
        classification.intent === "clarify" &&
        classification.question
      ) {
        gptResponse = { question: classification.question };
      } else {
        gptResponse = {
          question:
            "Could you confirm if the draft looks good, or tell me what to change (e.g., GSM, colors, design, wash)?",
        };
      }
    } else if (chat.state === "confirmed") {
      gptResponse = await sendToModel(
        getFollowUpPrompt(country, chat.confirmed_tech_pack)
      );
    }

    // Upload images after model calls
    const imageUrls = files.length ? await uploadImages(files) : [];
    if (imageUrls.length) {
      chat.messages[chat.messages.length - 1].content.imageUrls = imageUrls;
    }

    // Push model message
    chat.messages.push({
      sender: "gpt",
      content: gptResponse,
      timestamp: new Date(),
      isFinal: false,
    });

    // Heading
    if (!chat.heading || chat.heading === "New Chat") {
      const sourcePack =
        chat.confirmed_tech_pack ||
        chat.pending_tech_pack ||
        gptResponse?.tech_pack ||
        gptResponse?.draft_tech_pack;
      if (sourcePack) {
        try {
          const headingPrompt = getHeadingPrompt(sourcePack);
          const headingRes = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant that generates chat titles.",
              },
              { role: "user", content: headingPrompt },
            ],
            temperature: 0.3,
            max_tokens: 10,
          });
          chat.heading =
            headingRes.choices?.[0]?.message?.content?.trim() ||
            "Chat about Apparel";
        } catch {
          chat.heading = "Chat about Apparel";
        }
      }
    }

    // Finalization
    let isFinalAnswer = false;
    const originalCosts = gptResponse?.manufacturing_costs || null;
    let updatedCosts = null;

    if (gptResponse?.tech_pack && originalCosts) {
      isFinalAnswer = true;
      chat.confirmed_tech_pack = gptResponse.tech_pack;
      updatedCosts = adjustManufacturingCosts(originalCosts, country);
      chat.isCompleted = true;
      chat.state = "completed";
      chat.messages[chat.messages.length - 1].isFinal = true;
      chat.manufacturing_costs = updatedCosts;
    }

    await user.save();

    if (isFinalAnswer && updatedCosts) {
      const profitMargin =
        country.toLowerCase() === "india" ? ProfitMarginIndia : ProfitMarginUS;
      await Product.create({
        user_id: userId,
        chat_id: chatId,
        tech_pack: chat.confirmed_tech_pack,
        manufacturing_costs: originalCosts,
        profit_margin: profitMargin,
        country,
        conversion_rate: conversionRate,
        cost_with_profit: updatedCosts,
      });
      const emailHeading = chat.heading || "Product Estimate";

      sendEmails(
        userId,
        originalCosts,
        updatedCosts,
        emailHeading,
        chat.confirmed_tech_pack,
        files,
        profitMargin,
        country,
        chatId
      );
    }

    return res.json({
      chatId,
      heading: chat.heading,
      isCompleted: chat.isCompleted,
      state: chat.state,
      imageUrls,
      gptResponse,
      tech_pack:
        chat.confirmed_tech_pack ||
        chat.pending_tech_pack ||
        gptResponse?.tech_pack ||
        null,
      manufacturing_costs: chat.manufacturing_costs || null,
    });
  } catch (err) {
    console.error("validateClothing error:", err);
    return res.status(500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error."
          : err?.message || "Internal error",
    });
  }
};
