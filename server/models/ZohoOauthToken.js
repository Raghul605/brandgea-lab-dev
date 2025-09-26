import mongoose from "mongoose";

const zohoOauthTokenSchema = new mongoose.Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresAt: { type: Date, required: true }, // expiry for access token
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

zohoOauthTokenSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const ZohoOauthToken = mongoose.model("ZohoOauthToken", zohoOauthTokenSchema);

export default ZohoOauthToken;
