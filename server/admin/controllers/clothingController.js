import Product from '../../models/product.js';
import User from '../../models/User.js';
import mongoose from "mongoose";

const PRODUCT_FROM_DATE = process.env.PRODUCT_FROM_DATE ? new Date(process.env.PRODUCT_FROM_DATE) : null;

export async function getQuoteGarmentsChatWithUser(req, res) {
  try {
    const page = parseInt(req.query.page, 10) > 0 ? parseInt(req.query.page, 10) : 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const sortOrder = req.query.sort === 'asc' ? 1 : -1;

    // Build date filter if PRODUCT_FROM_DATE is set
    const dateFilter = PRODUCT_FROM_DATE ? { createdAt: { $gte: PRODUCT_FROM_DATE } } : {};

    // Fetch products with filters, pagination, and sorting
    const products = await Product.find(
      dateFilter,
      'quoteNumber garment_type user_id heading createdAt'
    )
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'user_id',
        select: 'name email -_id',
      })
      .lean();

    const totalCount = await Product.countDocuments(dateFilter);

    const results = products.map((p) => ({
      _id: p._id,
      quoteNumber: p.quoteNumber,
      garment_type: p.garment_type,
      heading:
        p.heading && typeof p.heading === "string" && p.heading.trim()
          ? p.heading
          : "Untitled Quote",
      user: p.user_id ? { name: p.user_id.name, email: p.user_id.email } : null,
      createdAt:p.createdAt
    }));
    res.status(200).json({
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      results,
      sortOrder: req.query.sort || 'desc',
    });
  } catch (error) {
    console.error('Error fetching sorted paginated products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


export async function getProductWithUserAndChat(req, res) {
  try {
    const { productId } = req.params;

    // Find product by ID
    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find the user associated with the product
    const user = await User.findById(product.user_id).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the chat within user's chats matching chat_id
    let chat = user.chat.find(
      (c) => c._id.toString() === (product.chat_id?.toString() || "")
    );

    if (chat) {
      // Exclude manufacturing_costs and _id from chat
      chat = {
        ...chat,
        manufacturing_costs: undefined,
        _id: undefined,
      };
    }

    // Fail-safe heading
    const heading = product.heading && typeof product.heading === "string" && product.heading.trim()
      ? product.heading
      : "Untitled Quote";

    const result = {
      product: {
        ...product,
        heading, 
      },
      user: {
        name: user.name,
        email: user.email,
      },
      chat: chat || null,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error chat details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getAllUsers(req, res) {
  try {
    const { name, email, direction = "desc", page = 1, limit = 10 } = req.query;

    let filter = {};

    if (name) filter.name = new RegExp(`^${name}`, "i");
    if (email) filter.email = new RegExp(`^${email}`, "i");

    const sortOrder = direction === "desc" ? -1 : 1;
    const sortObj = { createdAt: sortOrder };

    const users = await User.aggregate([
      { $match: filter },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          country: 1,
          chatCount: { $size: "$chat" },
          createdAt: 1,
        },
      },
      { $sort: sortObj },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
    ]);
    const totalCount = await User.countDocuments(filter);
    res.status(200).json({
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      results: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getUserDetails(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(userId).lean().select("-password -chat");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function findChatsByUser(req, res) {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, direction = "desc" } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 10;
    const sortOrder = direction === "asc" ? 1 : -1;

    // Fetch user and all chats
    const user = await User.findById(userId).lean();
    if (!user || !user.chat) {
      return res.status(404).json({ error: "User chats not found" });
    }

    // Separate old vs new model chats
    const oldModelChats = [];
    const newModelChats = [];
    user.chat.forEach(chat => {
      if (chat.prompt) {
        oldModelChats.push(chat);
      } else {
        newModelChats.push(chat);
      }
    });

    // Prepare all chat ids as ObjectIds to fetch products in one go
    const allChatIds = user.chat.map(c => {
      // Ensure ObjectId format
      if (mongoose.Types.ObjectId.isValid(c._id)) {
        return new mongoose.Types.ObjectId(c._id);
      }
      return c._id;
    });

    // Fetch all products linked to these chat ids and user id
    const products = await Product.find({
      user_id: new mongoose.Types.ObjectId(userId),
      chat_id: { $in: allChatIds },
    }).select("_id chat_id").lean();

    // Map products by chat_id string for quick lookup
    const productsMap = new Map();
    products.forEach(p => {
      productsMap.set(p.chat_id.toString(), p._id);
    });

    // Enrich old model chats (all old model chats have isCompleted true, heading "Untitled Quote")
    const enrichedOldChats = oldModelChats.map(chat => ({
      _id: chat._id,
      modelType: "oldModel",
      heading: "Untitled Quote",
      isCompleted: true,
      createdAt: chat.createdAt,
      productId: productsMap.get(chat._id.toString()) || null,
    }));

    // Enrich new model chats
    const enrichedNewChats = newModelChats.map(chat => ({
      _id: chat._id,
      modelType: "newModel",
      heading: chat.heading || "",
      isCompleted: chat.isCompleted,
      createdAt: chat.createdAt,
      productId: chat.isCompleted ? (productsMap.get(chat._id.toString()) || null) : null,
    }));

    // Combine all chats together
    let combinedChats = [...enrichedOldChats, ...enrichedNewChats];

    // Sort combined chats by createdAt with requested direction
    combinedChats.sort((a, b) => sortOrder * (new Date(a.createdAt) - new Date(b.createdAt)));

    // Pagination
    const totalChats = combinedChats.length;
    const totalPages = Math.ceil(totalChats / limitInt);
    combinedChats = combinedChats.slice((pageInt - 1) * limitInt, pageInt * limitInt);

    // Send response
    res.status(200).json({
      page: pageInt,
      limit: limitInt,
      totalPages,
      totalChatsInPage: combinedChats.length,
      totalChats,
      chats: combinedChats,
    });

  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getChatDetails(req, res) {
  try {
    const { userId, chatId } = req.params;

    if (!userId || !chatId) {
      return res.status(400).json({ error: "User ID and Chat ID are required" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const chatObjectId = new mongoose.Types.ObjectId(chatId);

    // Find user and extract the specific chat by chatId
    const user = await User.findOne(
      { _id: userObjectId, "chat._id": chatObjectId },
      { "chat.$": 1 }
    ).lean();

    if (!user || !user.chat || !user.chat.length) {
      return res.status(404).json({ error: "Chat not found for this user" });
    }

    const chat = user.chat[0];

    // Determine model type
    const modelType = chat.prompt ? "oldModel" : "newModel";

    // Look up product matching user and chat IDs
    const product = await Product.findOne({
      user_id: userObjectId,
      chat_id: chatObjectId,
    }).lean();

    // Prepare full chat details including product ID and model info
    const chatDetails = {
      ...chat,
      modelType,
      productId: product ? product._id : null,
    };

    // For oldModel, override heading and isCompleted as needed
    if (modelType === "oldModel") {
      chatDetails.heading = "Untitled Quote";
      chatDetails.isCompleted = true;
    }

    res.status(200).json({ chat: chatDetails });
  } catch (error) {
    console.error("Error fetching chat details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Delete a quote/product
export async function deleteQuote(req, res) {
  try {
    const { id } = req.params; // <-- expects `id`
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Quote not found" });
    }

    res.status(200).json({ message: "Quote deleted successfully" });
  } catch (error) {
    console.error("Error deleting quote:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
