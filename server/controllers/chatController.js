import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import User from "../models/User.js";
import mongoose from "mongoose";
import { MailLogger, QueuedEmail } from "../models/email.log.remainder.model.js";
import Product from "../models/product.js";

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
      return res.status(404).json({ message: "Chat not found" });
    }

    // Find the specific chat and update its heading
    const chat = user.chat.id(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.heading = heading;
    await user.save();

    res.json({
      message: "Chat heading updated successfully",
      chat: {
        _id: chat._id,
        heading: chat.heading,
        // include other fields if needed
      },
    });
  } catch (error) {
    console.error("Error updating chat heading:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BUCKET = process.env.AWS_S3_BUCKET;

function getS3Key(url) {
  if (!url) return null;
  const match = url.match(/\.amazonaws\.com\/(.+)$/);
  return match ? match[1] : null;
}

async function deleteImagesFromS3(urls = []) {
  const objects = urls
    .map(getS3Key)
    .filter(Boolean)
    .map((Key) => ({ Key }));
  if (!objects.length) {
    console.log("No images found for S3 deletion.");
    return;
  }
  console.log(`Deleting ${objects.length} image(s) from S3...`);
  await s3.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: objects },
    })
  );
  console.log("Images deleted from S3.");
}

export async function deleteProductChatAndImages(req, res) {
  const { userId, chatId } = req.body;
  console.log(`Received delete request for userId=${userId} chatId=${chatId}`);

  let imageUrls = [];

  try {
    // 1. Delete product
    console.log("Finding and deleting product...");
    const product = await Product.findOneAndDelete({
      user_id: userId,
      chat_id: chatId,
    });
    if (product) {
      const quoteNumber = product.quoteNumber || "N/A";
      console.log(`Product with quoteNumber ${quoteNumber} found and deleted.`);
      [
        product.tech_pack?.images,
        product.manufacturing_costs?.images,
        product.cost_with_profit?.images,
      ].forEach((images) =>
        Array.isArray(images) ? imageUrls.push(...images) : null
      );
      if (imageUrls.length)
        console.log(
          `Collected ${imageUrls.length} image(s) from product for deletion.`
        );
    } else {
      console.log("No product found for given userId and chatId.");
    }

    // 2. Update MailLogger to stop further emails
    const mailLog = await MailLogger.findOne({ userId, relatedChatId: chatId });
    if (mailLog) {
      if (!mailLog.stopFurtherEmails) {
        mailLog.stopFurtherEmails = true;
        await mailLog.save();
        console.log(
          `MailLogger for chatId ${chatId} updated to stop further emails.`
        );
      } else {
        console.log(
          `MailLogger for chatId ${chatId} already has stopFurtherEmails = true.`
        );
      }
    } else {
      console.log("No MailLogger entry found for chat.");
    }

    // 3. Delete queued emails related to the chat
    const delRes = await QueuedEmail.deleteMany({
      userId,
      relatedChatId: chatId,
    });
    if (delRes.deletedCount) {
      console.log(
        `Deleted ${delRes.deletedCount} queued email(s) related to chatId ${chatId}.`
      );
    } else {
      console.log("No queued emails found for chat.");
    }

    // 4. Delete chat from user and collect images for old/new model
    console.log("Looking up user and chat session...");
    const user = await User.findById(userId).lean();
    if (user?.chat?.length) {
      const chatSession = user.chat.find(
        (c) => String(c._id) === String(chatId)
      );
      if (chatSession) {
        console.log("Chat session found.");
        if (chatSession.prompt?.imageUrls) {
          imageUrls.push(...chatSession.prompt.imageUrls);
          console.log(
            `Collected ${chatSession.prompt.imageUrls.length} image(s) from old chat model.`
          );
        }
        if (Array.isArray(chatSession.messages)) {
          chatSession.messages.forEach((msg) => {
            if (msg.content?.images) {
              imageUrls.push(...msg.content.images);
              console.log(
                `Collected ${msg.content.images.length} image(s) from chat messages.`
              );
            }
          });
        }
      } else {
        console.log("Chat session not found.");
      }
      console.log("Removing chat session from user...");
      await User.updateOne(
        { _id: userId },
        { $pull: { chat: { _id: chatId } } }
      );
      console.log("Chat session removed.");
    } else {
      console.log("User not found or no chats available.");
    }

    // 5. Batch delete images from S3
    await deleteImagesFromS3(imageUrls);

    res.json({
      message:
        "Product, chat, mail logs, queued emails, and images deleted or updated",
    });
  } catch (err) {
    console.error("Error during deletion:", err);
    res
      .status(500)
      .send({ error: "Error during deletion", details: err.message });
  }
}

export async function deleteMultipleProductsAndChats(req, res) {
  const { productIds } = req.body;

  if (
    !Array.isArray(productIds) ||
    productIds.length === 0 ||
    productIds.length > 10
  ) {
    return res.status(400).json({
      error: "productIds must be an array of 1 to 10 product IDs.",
    });
  }

  let imageUrls = [];
  let processedCount = 0;

  try {
    // Fetch all products with the given IDs
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for given IDs." });
    }

    // Gather all userId, chatId combos to process related chat/mail deletions
    const userChatPairs = [];

    for (const product of products) {
      processedCount++;
      console.log(
        `Processing product with quoteNumber: ${product.quoteNumber || "N/A"}`
      );

      // Collect images from product fields
      [
        product.tech_pack?.images,
        product.manufacturing_costs?.images,
        product.cost_with_profit?.images,
      ].forEach((images) =>
        Array.isArray(images) ? imageUrls.push(...images) : null
      );

      userChatPairs.push({
        userId: product.user_id.toString(),
        chatId: product.chat_id?.toString(),
      });
    }

    // Delete products in bulk
    const deleteRes = await Product.deleteMany({ _id: { $in: productIds } });
    console.log(`Deleted ${deleteRes.deletedCount} products.`);

    // For each userId/chatId, update MailLogger, delete queued emails, delete chat session
    for (const { userId, chatId } of userChatPairs) {
      if (!userId || !chatId) continue;

      console.log(
        `Processing mail and chat for userId=${userId} chatId=${chatId}`
      );

      const mailLog = await MailLogger.findOne({
        userId,
        relatedChatId: chatId,
      });
      if (mailLog) {
        if (!mailLog.stopFurtherEmails) {
          mailLog.stopFurtherEmails = true;
          await mailLog.save();
          console.log(
            `MailLogger for chatId ${chatId} updated to stop further emails.`
          );
        } else {
          console.log(
            `MailLogger for chatId ${chatId} already has stopFurtherEmails = true.`
          );
        }
      } else {
        console.log("No MailLogger entry found for chat.");
      }

      const delQueued = await QueuedEmail.deleteMany({
        userId,
        relatedChatId: chatId,
      });
      if (delQueued.deletedCount) {
        console.log(
          `Deleted ${delQueued.deletedCount} queued email(s) related to chatId ${chatId}.`
        );
      } else {
        console.log("No queued emails found for chat.");
      }

      // Remove chat session from user
      const user = await User.findById(userId).lean();
      if (user?.chat?.length) {
        const chatSession = user.chat.find(
          (c) => String(c._id) === String(chatId)
        );
        if (chatSession) {
          console.log("Chat session found.");

          if (chatSession.prompt?.imageUrls) {
            imageUrls.push(...chatSession.prompt.imageUrls);
            console.log(
              `Collected ${chatSession.prompt.imageUrls.length} image(s) from old chat model.`
            );
          }

          if (Array.isArray(chatSession.messages)) {
            chatSession.messages.forEach((msg) => {
              if (msg.content?.images) {
                imageUrls.push(...msg.content.images);
                console.log(
                  `Collected ${msg.content.images.length} image(s) from chat messages.`
                );
              }
            });
          }
        } else {
          console.log("Chat session not found.");
        }

        await User.updateOne(
          { _id: userId },
          { $pull: { chat: { _id: chatId } } }
        );
        console.log("Chat session removed.");
      } else {
        console.log("User not found or no chats available.");
      }
    }

    // Finally, delete all collected images from S3
    await deleteImagesFromS3(imageUrls);

    res.json({
      message: `Processed ${processedCount} products and associated chats, mail logs, queued emails, and images deleted/updated.`,
    });
  } catch (err) {
    console.error("Error during multiple deletion:", err);
    res
      .status(500)
      .send({ error: "Error during deletion", details: err.message });
  }
}
