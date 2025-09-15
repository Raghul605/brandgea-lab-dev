// server/controllers/authController.cjs
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import User from "../models/User.js";


export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwtDecode(token);
    if (!decoded.sub || !decoded.email || !decoded.name) {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    const userData = {
      googleId: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
      country: "India",
    };

    let user = await User.findOne({ googleId: decoded.sub });

    if (!user) {
      user = new User(userData);
      await user.save();
    } else {
      user.lastLogin = Date.now();
      user.country = user.country || userData.country; // Save country if not already set
      await user.save();
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        country: user.country,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      error: "Authentication failed",
      details: error.message,
    });
  }
};

export const updateMobile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { mobile } = req.body;

    // Validate mobile number format if needed
    const digits = String(mobile || "").replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      return res.status(400).json({ error: "Invalid mobile number" });
    }

    const normalized = digits;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { mobile: normalized },
      { new: true, runValidators: true, context: "query" }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        picture: updatedUser.picture,
        country: updatedUser.country,
        mobile: updatedUser.mobile,
      },
    });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.mobile) {
      return res
        .status(409)
        .json({
          error: "This mobile number is already linked to another account.",
        });
    }
    console.error("Mobile update error:", error);
    return res.status(500).json({ error: "Failed to update mobile number" });
  }
};

export const updateCountry = async (req, res) => {
  try {
    const { userId } = req.user;
    const { country } = req.body;


    if (!country) {
      return res.status(400).json({ error: "Country is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { country },
      { new: true, runValidators: true, context: "query" }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        picture: updatedUser.picture,
        country: updatedUser.country,
        mobile: updatedUser.mobile,
      },
    });
  } catch (error) {
    console.error("Country update error:", error);
    return res.status(500).json({ error: "Failed to update country" });
  }
};