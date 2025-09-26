import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cron from 'node-cron';


//Route imports
import authRoutes from "./routes/authRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import clothingRoutes from "./routes/clothingRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

//admin route import
// import clothingAdminRoutes from "./admin/routes/clothingRoute.js";
import ReminderIntervalRoutes from "./routes/ReminderInterval.routes.js";

//Function Imports
import { queueDueReminderEmails } from "./utils/queueDueReminderEmails.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : ["http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Add security headers middleware
// app.use((req, res, next) => {
//   res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");

//   // Also set other security headers
//   res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
//   res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

//   next();
// });

app.set("trust proxy", true);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/clothing", clothingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/zoho", paymentRoutes);

// Admin Routes
// app.use("/api/admin/clothing", clothingAdminRoutes);
app.use("/api/admin/email-service", ReminderIntervalRoutes);

// app.get('/', (req, res) => {
//   res.send('Server is running 🚀');
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

cron.schedule('0 */4 * * *', () => {
  console.log('Running scheduled reminder queue job at', new Date());
  queueDueReminderEmails().catch(err => {
    console.error('Error in reminder queue job:', err);
  });
});
