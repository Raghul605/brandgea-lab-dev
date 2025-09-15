import mongoose from "mongoose";

const { Schema } = mongoose;

// Mail Logger Schema: logs sent emails & reminder status
const MailLoggerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientEmail: { type: String, required: true },
    emailType: { type: String, required: true },
    heading: { type: String },   // New field added here
    createdAt: { type: Date, default: Date.now },
    stopFurtherEmails: { type: Boolean, default: false },
    reminderSent: {
      type: Map,
      of: Boolean,
      default: {},
    },
    relatedChatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  },
  { timestamps: true }
);


// Queued Email Schema: stores emails queued for sending
const QueuedEmailSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reminderLabel: { type: String, required: true }, // e.g., '6hr', '24hr', '48hr'
    mailLoggerId: {
      type: Schema.Types.ObjectId,
      ref: "MailLogger",
      required: true,
    },
    failedToSend: { type: Boolean, default: false },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    relatedChatId: { type: Schema.Types.ObjectId, ref: "Chat" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Reminder Interval Schema: defines schedule & leeway for reminders
const ReminderIntervalSchema = new Schema(
  {
    label: { type: String, required: true, unique: true }, // e.g., '6hr', '24hr', '48hr'

    intervalValue: {
      type: Number,
      required: true,
      min: 1,
    }, // numeric value for interval (e.g., 1, 30, etc.)

    intervalUnit: {
      type: String,
      required: true,
      enum: ["S", "M", "HR"], // S = seconds, M = minutes, HR = hours
      default: "HR",
    },

    leewayHours: { type: Number, default: 5 },

    active: { type: Boolean, default: true }, // enable/disable reminder

    templateId: { type: String, default: null }, // optional, email template reference
  },
  { timestamps: true }
);

// Export all models
export const MailLogger = mongoose.model("MailLogger", MailLoggerSchema);
export const QueuedEmail = mongoose.model("QueuedEmail", QueuedEmailSchema);
export const ReminderInterval = mongoose.model(
  "ReminderInterval",
  ReminderIntervalSchema
);
