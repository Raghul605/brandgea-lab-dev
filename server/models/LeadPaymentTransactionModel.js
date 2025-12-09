import mongoose from "mongoose";

const leadPaymentTransactionSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  payments_session_id: {
    type: String,
    required: false,
  },
  amountQuoted: {
    type: Number,
    required: true,
  },
  amountPaid: {
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
    enum: [
      "pending",
      "succeeded",
      "failed",
      "refunded",
      "success_pre_confirmation",
      "closed",
    ],
    required: true,
    default: "pending",
  },
  paymentMethod: {
    type: String,
  },
  description: {
    type: String,
    required: false,
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  session_created_time: {
    type: Number,
    required: false, // Unix timestamp (seconds)
  },
  payment_created_time: {
    type: Number,
    required: false, // Unix timestamp (seconds)
  },
  expiryTime: {
    type: Date,
    required: true,
  },
  Lead_doc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LeadManagement",
    required: false,
  },
  LeadID: {
    type: String,
    required: false,
    trim: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VendorDetails",
    required: false,
  },
  VendorEmail: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  responseType: {
    type: String,
    required: false,
    trim: true,
  },
  webhook_processed: { type: Boolean, default: false },
  updatedAt: Date,
});

const LeadPaymentTransactions = mongoose.model(
  "LeadPaymentTransactions",
  leadPaymentTransactionSchema
);

export default LeadPaymentTransactions;
