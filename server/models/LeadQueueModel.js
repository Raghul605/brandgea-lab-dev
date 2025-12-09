import mongoose from "mongoose";

const leadQueueSchema = new mongoose.Schema(
  {
    doc_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "ManufacturerFindTransaction", // reference this model
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const LeadQueue = mongoose.model("LeadQueue", leadQueueSchema);

export default LeadQueue;
