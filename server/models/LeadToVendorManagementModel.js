import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. "leadidNOV25"
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

const vendorQuotesSchema = new mongoose.Schema({
  Timestamp: {
    type: Date,
    default: Date.now,
  },
  VendorEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  customerEmailId: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  amountQuoted: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  Status: {
    type: String,
    enum: ["success_pre_confirmation", "succeeded"],
    default: "success_pre_confirmation",
  },
  expiryTime: {
    type: Date,
    required: true,
  },
  sentCustomerDetailsToVendorAt: {
    type: Date,
    required: false,
  },
  sentVendorDetailsToCustomerAt: {
    type: Date,
    required: false,
  },
  sentCustomerDetailsToVendor: {
    type: Boolean,
    default: false,
    required: false,
  },
  sentVendorDetailsToCustomer: {
    type: Boolean,
    default: false,
    required: false,
  },
});

// ✅ REMOVED: removeExpiredVendorQuotes static method

const leadManagementSchema = new mongoose.Schema({
  LeadID: {
    type: String,
    unique: true,
    trim: true,
  },
  CustomerName: {
    type: String,
    required: true,
    trim: true,
  },
  CustomerMobile: {
    type: String,
    required: true,
    trim: true,
  },
  CustomerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  leadTitle: {
    type: String,
    required: true,
    trim: true,
  },
  Requirement: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  referenceimages: {
    type: [String],
    default: [],
  },
  Quantity: {
    type: Number,
    required: true,
  },
  TargetCost: {
    type: Number,
    required: true,
  },
  TargetTAT: {
    type: String,
    required: true,
  },
  additionalImagesOrDocs: {
    type: [String],
    default: [],
  },
  intentScore: {
    type: Number,
    required: false,
  },
  number_of_recieved_quotes: {
    type: Number,
    default: 0,
  },
  max_number_of_allowed_quotes: {
    type: Number,
    default: 5,
  },
  vendor_quotes: [vendorQuotesSchema],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  chatId: {
    type: String,
    required: false,
  },
  lead_status_active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

// ✅ KEEP: Pre-save hook for LeadID generation ONLY
leadManagementSchema.pre("save", async function (next) {
  const doc = this;
  if (doc.isNew) {
    const now = new Date();
    const monthShort = now
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase();
    const yearShort = now.getFullYear().toString().slice(-2);

    const counterId = `leadid${monthShort}${yearShort}`;

    const counter = await mongoose
      .model("Counter")
      .findOneAndUpdate(
        { id: counterId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

    const seqNumber = counter.seq.toString().padStart(4, "0");

    doc.LeadID = `L${seqNumber}${monthShort}${yearShort}`;
  }
  next();
});

const LeadManagement = mongoose.model("LeadManagement", leadManagementSchema);

export default LeadManagement;
