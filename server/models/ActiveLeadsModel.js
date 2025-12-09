import mongoose from "mongoose";

const activeLeadsSchema = new mongoose.Schema({
  Lead_Doc_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LeadManagement",
    required: true,
    unique: true, // one activeLeads row per lead
  },
  LeadID: {
    type: String,
    required: true, // store the L1NOV25 code for quick display
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
});

const ActiveLeads = mongoose.model("ActiveLeads", activeLeadsSchema);

export default ActiveLeads;
