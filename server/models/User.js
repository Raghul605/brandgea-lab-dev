import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "gpt"],
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed, // string or object as needed
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isFinal: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      default: "New Chat",
      required: true,
    },
    messages: [messageSchema],
    state: {
      type: String,
      enum: ["collecting", "awaiting_confirmation", "confirmed", "completed"],
      default: "collecting",
    },
    pending_tech_pack: { type: mongoose.Schema.Types.Mixed, default: null },
    confirmed_tech_pack: { type: mongoose.Schema.Types.Mixed, default: null },
    manufacturing_costs: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
     Payments_For_ManufacturerFind: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const authTokenSchema = new mongoose.Schema(
  {
    deviceName: { type: String, required: true },
    browser: { type: String, required: true },
    refreshToken: { type: String, required: true },
    refreshTokenExpiry: { type: Date }, // optional expiry for refresh token
    sessionToken: { type: String, required: true },
    sessionTokenExpiry: { type: Date, required: true }, // expiry of session token
    loggedIn: { type: Boolean, default: true },
    lastLogin: { type: Date, default: Date.now },
    userAgent: { type: String }, // client userAgent string
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
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
      required: false,
    },
        password: {
      type: String,
      required: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    picture: { type: String, default: "" },
    country: {
      type: String,
      default: "India",
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    chat: [chatSchema], 
    authTokens: [authTokenSchema],
    transactions: [
      {
        ManufacturerFind_collectionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ManufacturerFindTransaction",
        },
        payments_session_id: {
          type: String,
          required: false,
        },
        chatId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Chat",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.model("User", userSchema);

export default User;

// import mongoose from "mongoose";

// const chatSchema = new mongoose.Schema(
//   {
//     prompt: {
//       text: { type: String, required: true },
//       imageUrls: [{ type: String, required: true }],
//     },
//     manufacturing_costs: {
//       type: mongoose.Schema.Types.Mixed,
//       required: true,
//     },
//     createdAt: { type: Date, default: Date.now },
//   },
//   { _id: true }
// );

// const userSchema = new mongoose.Schema(
//   {
//     googleId: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     mobile: {
//       type: String,
//     },
//     picture: String,
//     country: { type: String, default: "India" },
//     lastLogin: {
//       type: Date,
//       default: Date.now,
//     },
//     chat: [chatSchema],
//   },
//   { timestamps: true, versionKey: false }
// );

// const User = mongoose.model("User", userSchema);

// export default User;
