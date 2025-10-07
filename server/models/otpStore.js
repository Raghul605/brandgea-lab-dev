import mongoose from "mongoose";

const identifierSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // "mobile" or "email"
    value: { type: String, required: true },
  },
  { _id: false }
);

const otpStoreSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional, after permanent user creation
    identifier: { type: identifierSchema, required: true },
    otp: { type: String }, 
    txnId: { type: String },// stored for email; SMS may be handled by provider
    reason: {
      type: String,
      required: true,
      enum: [
        "userRegistration",
        "addPhoneNumber",
        "updateProfile",
        "resetPassword",
        "otherReason",
      ],
    },
    expiry: { type: Date },
    deliveryMethod: {
      type: String,
      required: true,
      enum: ["sms", "email"], // user selection for OTP delivery
    },
    // Extended user registration fields for temp storage:
    name: { type: String },
    email: { type: String },
    mobile: { type: String },
    password: { type: String },
    country: { type: String },
  },
  { timestamps: true }
);

const otpStore = mongoose.model("otpStore", otpStoreSchema);
export default otpStore;

// // models/otpStore.js
// import mongoose from 'mongoose';

// const identifierSchema = new mongoose.Schema({
//   type: {
//     type: String,
//     required: true,
//   },
//   value: {
//     type: String,
//     required: true,
//   },
// }, { _id: false }); // Prevent creating _id for subdocument

// const otpStoreSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
//   identifier: {
//     type: identifierSchema,
//     required: true,
//   },
//   otp: { type: String, required: true },
//   reason: {
//     type: String,
//     required: true,
//     enum: ['addPhoneNumber', 'updateProfile', 'resetPassword', 'otherReason', 'userRegistration'] // your use cases
//   },
//   expiry: { type: Date, required: true },
// }, { timestamps: true });

// const otpStore = mongoose.model('otpStore', otpStoreSchema);
// export default otpStore;
