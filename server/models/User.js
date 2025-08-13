import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    prompt: {
      text: { type: String, required: true },
      imageUrls: [{ type: String, required: true }], // Array of image URLs
    },
    manufacturing_costs: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
    },
    picture: String,
    country: { type: String, default: "India" },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    chat: [chatSchema],
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.model("User", userSchema);

export default User;
