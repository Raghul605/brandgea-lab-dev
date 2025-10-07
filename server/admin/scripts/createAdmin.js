import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import AdminUser from "../models/admin_users.js";

dotenv.config({ path: "../../.env" }); // Go two levels up to server/.env


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Function to create an admin
const createAdmin = async () => {
  try {
    const username = "Depakar"; // Change as needed
    const email = "depakar19@gmail.com"; // Change as needed
    const password = "Depakar@#2001"; // Change as needed

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ email });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      process.exit();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new AdminUser({
      username,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();
    console.log("✅ Admin user created successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
