// // server/admin/controllers/orderController.js
// import Order from '../models/order.js';
// import User from '../../models/User.js'; // ✅ use your existing User model
// import uploadImages from '../../utils/s3Upload.js';
// import crypto from 'crypto';


// export const createOrder = async (req, res) => {
//   try {
//     console.log("req.body:", req.body);
//     console.log("req.files:", req.files);

//     const {
//       serviceType,
//       clientEmail,
//       clientName,
//       clientPhone,
//       product,
//       quantity,
//       targetShipDate,
//       expectedDeliveryDate,
//       deliveryLocation,
//       manufacturingCompany,
//       manufacturingLocation,
//       manufacturingContact,
//     } = req.body;

//     // ✅ Upload files if any
//     let imageUrls = [];
//     if (req.files && req.files.length > 0) {
//       imageUrls = await uploadImages(req.files); // returns array of URLs
//     }

//     const order = new Order({
//       serviceType,
//       client: { email: clientEmail, name: clientName, phone: clientPhone },
//       product,
//       quantity,
//       targetShipDate,
//       expectedDeliveryDate,
//       deliveryLocation,
//       manufacturingDetails: {
//         companyName: manufacturingCompany,
//         location: manufacturingLocation,
//         contactPerson: manufacturingContact,
//       },
//       files: imageUrls, // ✅ store uploaded image URLs here
//       status: {
//         currentStatus: "Order Created",
//         notes: "",
//         isNotePublic: false,
//         updatedBy: "Admin",
//         updatedAt: new Date(),
//         createdAt: new Date(),
//         statusHistory: [
//           { status: "Order Created", notes: "", updatedBy: "Admin", updatedAt: new Date() }
//         ],
//       },
//     });

//     await order.save();
//     res.status(201).json(order);
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ error: err.message });
//   }
// };


// // ✅ Get all orders (with pagination)
// export const getOrders = async (req, res) => {
//   try {
//     let { page = 1, limit = 12 } = req.query;
//     page = parseInt(page);
//     limit = parseInt(limit);

//     const totalCount = await Order.countDocuments();
//     const totalPages = Math.ceil(totalCount / limit);

//     const orders = await Order.find()
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit);

//     res.json({ page, totalPages, totalCount, results: orders });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ Get order by ID
// export const getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) return res.status(404).json({ error: 'Order not found' });
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ Update order
// export const updateOrder = async (req, res) => {
//   try {
//     const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     res.json(order);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };



// export const addStatusUpdate = async (req, res) => {
//   try {
//     const { status, notes, updatedBy, isNotePublic } = req.body;

//     const order = await Order.findById(req.params.id);
//     if (!order) return res.status(404).json({ error: 'Order not found' });

//     // ✅ Upload files to S3 if any
//     let imageUrls = [];
//     if (req.files && req.files.length > 0) {
//       imageUrls = await uploadImages(req.files);
//     }

//     // Push new status into history
//     order.status.statusHistory.push({
//       status,
//       notes,
//       updatedBy,
//       updatedAt: new Date(),
//       images: imageUrls,
//     });

//     // Update current status
//     order.status.currentStatus = status;
//     order.status.notes = notes;
//     order.status.isNotePublic = isNotePublic ?? order.status.isNotePublic;
//     order.status.updatedBy = updatedBy;
//     order.status.updatedAt = new Date();

//     await order.save();
//     res.json(order);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };


// // ✅ Get client details by email (for autofill)
// export const getClientByEmail = async (req, res) => {
//   try {
//     const { email } = req.query;
//     console.log("Email received:", email);

//     if (!email) return res.status(400).json({ message: 'Email is required' });

//     const user = await User.findOne({
//       email: { $regex: new RegExp(`^${email.trim()}$`, 'i') }
//     }).lean();
//     console.log("User found:", user);

//     if (!user) return res.status(404).json({ message: 'Client not found' });

//     res.status(200).json({
//       name: user.name,
//       phone: user.mobile || "",
//       email: user.email,
//     });
//   } catch (err) {
//     console.error("Error in getClientByEmail:", err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// export const getClientByPhone = async (req, res) => {
//   try {
//     const { phone } = req.query;
//     console.log("Phone received:", phone);

//     if (!phone) return res.status(400).json({ message: 'Phone number is required' });

//     // Find user by phone
//     const user = await User.findOne({ mobile: phone.trim() }).lean();
//     console.log("User found:", user);

//     if (!user) return res.status(404).json({ message: 'Client not found' });

//     res.status(200).json({
//       name: user.name,
//       phone: user.mobile || "",
//       email: user.email,
//     });
//   } catch (err) {
//     console.error("Error in getClientByPhone:", err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// import mongoose from 'mongoose';

// export async function deleteOrder(req, res) {
//   try {
//     const { id } = req.params;
//     console.log("Deleting order ID:", id);

//     // ✅ Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: "Invalid order ID" });
//     }

//     const deleted = await Order.findByIdAndDelete(id);

//     if (!deleted) {
//       return res.status(404).json({ error: "Order not found" });
//     }

//     res.status(200).json({ message: "Order deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting order:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }




// // ✅ Generate or retrieve tracking link for an order
// export const generateTrackingLink = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await Order.findById(id);
//     if (!order) return res.status(404).json({ error: 'Order not found' });

//     // If token not yet generated, create one
//     if (!order.trackingToken) {
//       order.trackingToken = crypto.randomBytes(16).toString('hex');
//       await order.save();
//     }

//     // Use CLIENT_ORIGIN from env
//     const frontendURL = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
//     const trackingLink = `${frontendURL}/track-order/${order.trackingToken}`;

//     res.json({ trackingLink });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ Public endpoint: get order info by tracking token
// export const getOrderByTrackingToken = async (req, res) => {
//   try {
//     const { trackingToken } = req.params;
//     const order = await Order.findOne({ trackingToken });

//     if (!order) return res.status(404).json({ error: 'Invalid or expired tracking link' });

//     // Only return safe fields to the client
//     res.json({
//       serviceType: order.serviceType,
//       product: order.product,
//       quantity: order.quantity,
//       deliveryLocation: order.deliveryLocation,
//       targetShipDate: order.targetShipDate,
//       expectedDeliveryDate: order.expectedDeliveryDate,
//       status: {
//         currentStatus: order.status.currentStatus,
//         notes: order.status.isNotePublic ? order.status.notes : "",
//         updatedAt: order.status.updatedAt,
//         statusHistory: order.status.statusHistory, // filter if needed
//       },
//       files: order.files, // optional
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };
// server/admin/controllers/orderController.js
import Order from '../models/order.js';
import User from '../../models/User.js';
import uploadImages from '../../utils/s3Upload.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

// ✅ Create Order
export const createOrder = async (req, res) => {
  try {
    const {
      serviceType,
      clientEmail,
      clientName,
      clientPhone,
      productName, 
      garmentType,
      material,
      gsm,
      colors,
      design,
      sizes,
      printingType,
      totalQuantity,
      costPerPiece,
      totalLotValue,
      targetShipDate,
      expectedDeliveryDate,
      deliveryLocation,
      manufacturingCompany,
      manufacturingContact,
      manufacturingAddress,
      manufacturingCity,
      manufacturingState,
      manufacturingPostalCode,
      manufacturingCountry,
    } = req.body;

    // ✅ Upload files if any
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImages(req.files);
    }

    const order = new Order({
      serviceType,
      client: { email: clientEmail, name: clientName, phone: clientPhone },
      product: {
        productName, 
        garmentType,
        material,
        gsm,
        colors,
        design,
        sizes,
        printingType,
        totalQuantity,
        costPerPiece,
        totalLotValue,
      },
      targetShipDate,
      expectedDeliveryDate,
      deliveryLocation,
      manufacturingDetails: {
        companyName: manufacturingCompany,
        contactPerson: manufacturingContact,
        location: {
          address: manufacturingAddress, // updated
          city: manufacturingCity,
          state: manufacturingState,
          postalCode: manufacturingPostalCode,
          country: manufacturingCountry,
        },
      },
      files: imageUrls,
      status: {
        currentStatus: "Order Created",
        notes: "",
        isNotePublic: false,
        updatedBy: "Admin",
        updatedAt: new Date(),
        createdAt: new Date(),
        statusHistory: [
          { status: "Order Created", notes: "", updatedBy: "Admin", updatedAt: new Date() }
        ],
      },
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all orders (with pagination)
export const getOrders = async (req, res) => {
  try {
    let { page = 1, limit = 12 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const totalCount = await Order.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ page, totalPages, totalCount, results: orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Order
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Handle file uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImages(req.files);
    }

    // ✅ Build update object
    const updateData = {
      serviceType: req.body.serviceType,
      client: {
        email: req.body.clientEmail,
        name: req.body.clientName,
        phone: req.body.clientPhone,
      },
      product: {
        productName: req.body.productName,
        garmentType: req.body.garmentType,
        material: req.body.material,
        gsm: req.body.gsm,
        colors: req.body.colors,
        design: req.body.design,
        sizes: req.body.sizes,
        printingType: req.body.printingType,
        totalQuantity: req.body.totalQuantity,
        costPerPiece: req.body.costPerPiece,
        totalLotValue: req.body.totalLotValue,
      },
      targetShipDate: req.body.targetShipDate,
      expectedDeliveryDate: req.body.expectedDeliveryDate,
      deliveryLocation: req.body.deliveryLocation,
      manufacturingDetails: {
        companyName: req.body.manufacturingCompany,
        contactPerson: req.body.manufacturingContact,
        location: {
          address: req.body.manufacturingAddress, // updated
          city: req.body.manufacturingCity,
          state: req.body.manufacturingState,
          postalCode: req.body.manufacturingPostalCode,
          country: req.body.manufacturingCountry,
        },
      },
    };

// Append uploaded files
    if (imageUrls.length > 0) {
      updateData.$push = { files: { $each: imageUrls } };
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedOrder) return res.status(404).json({ error: "Order not found" });

    res.json(updatedOrder);
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(400).json({ error: err.message });
  }
};


// ✅ Add Status Update
export const addStatusUpdate = async (req, res) => {
  try {
    const { status, notes, updatedBy, isNotePublic } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImages(req.files);
    }

    order.status.statusHistory.push({
      status,
      notes,
      updatedBy,
      updatedAt: new Date(),
      images: imageUrls,
    });

    order.status.currentStatus = status;
    order.status.notes = notes;
    order.status.isNotePublic = isNotePublic ?? order.status.isNotePublic;
    order.status.updatedBy = updatedBy;
    order.status.updatedAt = new Date();

    await order.save();
    res.json(order);
  } catch (err) {
    console.error("Error in addStatusUpdate:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get client details by email
export const getClientByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } }).lean();
    if (!user) return res.status(404).json({ message: 'Client not found' });

    res.json({ name: user.name, phone: user.mobile || "", email: user.email });
  } catch (err) {
    console.error("Error in getClientByEmail:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ✅ Get client details by phone
export const getClientByPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    const user = await User.findOne({ mobile: phone.trim() }).lean();
    if (!user) return res.status(404).json({ message: 'Client not found' });

    res.json({ name: user.name, phone: user.mobile || "", email: user.email });
  } catch (err) {
    console.error("Error in getClientByPhone:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ✅ Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Order not found" });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Generate Tracking Link
export const generateTrackingLink = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (!order.trackingToken) {
      order.trackingToken = crypto.randomBytes(16).toString('hex');
      await order.save();
    }

    const frontendURL = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    const trackingLink = `${frontendURL}/track-order/${order.trackingToken}`;

    res.json({ trackingLink });
  } catch (err) {
    console.error("Error generating tracking link:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Order by Tracking Token
export const getOrderByTrackingToken = async (req, res) => {
  try {
    const { trackingToken } = req.params;
    const order = await Order.findOne({ trackingToken });
    if (!order) return res.status(404).json({ error: 'Invalid or expired tracking link' });

    res.json({
      serviceType: order.serviceType,
      product: order.product,
      deliveryLocation: order.deliveryLocation,
      targetShipDate: order.targetShipDate,
      expectedDeliveryDate: order.expectedDeliveryDate,
      status: {
        currentStatus: order.status.currentStatus,
        notes: order.status.isNotePublic ? order.status.notes : "",
        updatedAt: order.status.updatedAt,
        statusHistory: order.status.statusHistory,
      },
      files: order.files,
    });
  } catch (err) {
    console.error("Error in getOrderByTrackingToken:", err);
    res.status(500).json({ error: err.message });
  }
};
