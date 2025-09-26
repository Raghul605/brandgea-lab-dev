import mongoose from "mongoose";

const manufacturerFindTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  message: {
    type: String,
    required: false,
  },
  payments_session_id: {
    type: String,
    required: false,
  },
  payment_id: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: "INR",
  },
  status: {
    type: String,
    enum: ["pending", "succeeded", "failed"],
    default: "pending",
  },
  description: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  session_created_time: {
    type: Number,
    required: true,
  },
  payment_created_time: {
    type: Number,
    required: false,
  },
  updatedAt: Date,
});

const ManufacturerFindTransaction = mongoose.model(
  "ManufacturerFindTransaction",
  manufacturerFindTransactionSchema
);

export default ManufacturerFindTransaction;