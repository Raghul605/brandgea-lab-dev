// // admin/models/order.js
// import mongoose from 'mongoose';

// // ✅ Status History Schema
// const statusHistorySchema = new mongoose.Schema({
//   status: { type: String, required: true },
//   notes: { type: String, default: "" },
//   updatedBy: { type: String, default: "Admin" },
//   updatedAt: { type: Date, default: Date.now },
//   images: [{ type: String }] // array of image URLs for this status
// });

// // ✅ Order Schema
// const orderSchema = new mongoose.Schema(
//   {
//     serviceType: { type: String, required: true },
//     client: {
//       email: { type: String, required: true },
//       name: { type: String, default: "" },
//       phone: { type: String, default: "" }
//     },
//     product: { type: String, required: true },
//     quantity: { type: Number, default: 1 },
//     targetShipDate: { type: Date },
//     expectedDeliveryDate: { type: Date },
//     deliveryLocation: { type: String, default: "" },
//     files: [{ type: String }], // array to store uploaded image URLs/files
//     manufacturingDetails: {
//       companyName: { type: String, default: "" },
//       contactPerson: { type: String, default: "" },
//       location: { type: String, default: "" }
//     },
//     status: {
//       currentStatus: { type: String, default: "Order Created" },
//       notes: { type: String, default: "" },
//       isNotePublic: { type: Boolean, default: false },
//       updatedBy: { type: String, default: "Admin" },
//       updatedAt: { type: Date, default: Date.now },
//       createdAt: { type: Date, default: Date.now },
//       statusHistory: [statusHistorySchema] // track status changes with optional images
//     },

//     // 👇 Add this new field for public tracking
//     trackingToken: {
//       type: String,
//       unique: true,
//       sparse: true // allows null until generated
//     }
//   },
//   { timestamps: true } // adds createdAt & updatedAt
// );

// // ✅ Export model
// const Order = mongoose.model('Order', orderSchema);
// export default Order;
// admin/models/order.js
// admin/models/order.js
import mongoose from "mongoose";

// ✅ Status History Schema
const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  notes: { type: String, default: "" },
  updatedBy: { type: String, default: "Admin" },
  updatedAt: { type: Date, default: Date.now },
  images: [{ type: String }] // array of image URLs for this status
});

// ✅ Order Schema
const orderSchema = new mongoose.Schema(
  {
    serviceType: { type: String, required: true },

    // 🔹 Client Details
    client: {
      email: { type: String, required: true },
      name: { type: String, default: "" },
      phone: { type: String, default: "" }
    },

    // 🔹 Product Details (merged technical + commercial)
    product: {
      productName: { type: String, default: "" },
      garmentType: { type: String, required: true },
      material: { type: String, required: true },
      gsm: { type: Number },
      colors: [{ type: String }],
      // design: [
      //   {
      //     placement: { type: String },
      //     type: { type: String }
      //   }
      // ],
      sizes: [
        {
          size: { type: String },
          quantity: { type: Number }
        }
      ],
      printingType: { type: String },
      totalQuantity: { type: Number, required: true },
      costPerPiece: { type: Number },
      totalLotValue: { type: Number }
    },

    // 🔹 Order Logistics
    targetShipDate: { type: Date },
    expectedDeliveryDate: { type: Date },
    deliveryLocation: { type: String, default: "" },

    // 🔹 Uploaded files
    files: [{ type: String }],

    // 🔹 Manufacturing Info (structured address)
    manufacturingDetails: {
      companyName: { type: String, default: "" },
      contactPerson: { type: String, default: "" },
      location: {
        address: { type: String, default: "" }, // replaced street with address
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        postalCode: { type: String, default: "" },
        country: { type: String, default: "" }
      }
    },

    // 🔹 Status tracking
    status: {
      currentStatus: { type: String, default: "Order Created" },
      notes: { type: String, default: "" },
      isNotePublic: { type: Boolean, default: false },
      updatedBy: { type: String, default: "Admin" },
      updatedAt: { type: Date, default: Date.now },
      createdAt: { type: Date, default: Date.now },
      statusHistory: [statusHistorySchema]
    },

    // 🔹 Public tracking link
    trackingToken: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  { timestamps: true }
);

// ✅ Export model
const Order = mongoose.model("Order", orderSchema);
export default Order;
