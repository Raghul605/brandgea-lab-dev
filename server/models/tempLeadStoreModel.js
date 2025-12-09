import mongoose from "mongoose";

const tempLeadStoreSchema = new mongoose.Schema({
  CustomerName: { type: String, required: true, trim: true },
  CustomerMobile: { type: String, required: true, trim: true },
  CustomerEmail: { type: String, required: true, lowercase: true, trim: true },
  leadTitle: { type: String, required: true, trim: true },
  Requirement: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },

  doc_created_by: {
    type: String,
    enum: ["system", "user"],
    default: "system",
  },
  referenceimages: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,

  // New fields
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Add ref if using population
  chatId: { type: String, required: false },
  ManufacturerFindTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ManufacturerFindTransaction",
    required: false,
  },
  Quantity: { type: Number },
  TargetCost: { type: Number },
  TargetTAT: { type: Number },
  number_of_recieved_quotes: { type: Number, default: 0 },
  max_number_of_allowed_quotes: { type: Number, default: 5 },
  LTVM_Automated: {
    type: Boolean,
    default: true,
  },
});

const TempLeadStore = mongoose.model("TempLeadStore", tempLeadStoreSchema);

export default TempLeadStore;
