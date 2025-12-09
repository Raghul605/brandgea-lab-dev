import mongoose from "mongoose";

const lockSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  lockedAt: { type: Date, default: Date.now },
});

const Lock = mongoose.model("Lock", lockSchema);

export default Lock;
