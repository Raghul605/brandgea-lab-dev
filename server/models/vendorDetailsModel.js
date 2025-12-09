import mongoose from "mongoose";

const transactionHistorySchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    trim: true,
  },
  Lead_doc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LeadManagement",
    required: true,
  },
  LeadID: {
    type: String,
    required: true,
    trim: true,
  },
  amountQuoted: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["success_pre_confirmation", "succeeded"],
    required: true,
    trim: true,
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  payments_session_id: {
    type: String,
    required: true,
  },
  payment_category: {
    // ✅ ADDED
    type: String,
    default: "lead_quoting_payment",
  },
});

const vendorDetailsSchema = new mongoose.Schema({
  VendorEmail: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
  },
  VendorName: {
    type: String,
    required: true,
    trim: true,
  },
  VendorPhone: {
    type: String,
    required: true,
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  doc_link: {
    type: String,
    required: false,
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  transactionHistory: {
    type: [transactionHistorySchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

const VendorDetails = mongoose.model("VendorDetails", vendorDetailsSchema);

export default VendorDetails;
