// // server/controllers/authController.cjs
// import jwt from "jsonwebtoken";
// import { jwtDecode } from "jwt-decode";
// import User from "../models/User.js";
// import { OAuth2Client } from "google-auth-library";

// // const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // export const googleLogin = async (req, res) => {
// //   try {
// //     const { token } = req.body;
// //     const ticket = await googleClient.verifyIdToken({
// //       idToken: token,
// //       audience: process.env.GOOGLE_CLIENT_ID,
// //     });
// //     const payload = ticket.getPayload(); // verified

// //     if (!payload?.sub || !payload?.email || !payload?.name) {
// //       return res.status(400).json({ error: "Invalid Google token" });
// //     }

// //     const userData = {
// //       googleId: payload.sub,
// //       name: payload.name,
// //       email: payload.email,
// //       picture: payload.picture,
// //       country: "India",
// //     };

// //     let user = await User.findOne({ googleId: payload.sub });
// //     if (!user) {
// //       user = new User(userData);
// //       await user.save();
// //     } else {
// //       user.lastLogin = Date.now();
// //       user.country = user.country || userData.country;
// //       await user.save();
// //     }

// //     const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
// //       expiresIn: "24h",
// //     });

// //     res.json({
// //       token: jwtToken,
// //       user: {
// //         _id: user._id,
// //         name: user.name,
// //         email: user.email,
// //         picture: user.picture,
// //         country: user.country,
// //         mobile: user.mobile,
// //       },
// //     });
// //   } catch (error) {
// //     console.error("Google login error:", error);
// //     res.status(500).json({ error: "Authentication failed", details: error.message });
// //   }
// // };

// export const googleLogin = async (req, res) => {
//   try {
//     const { token } = req.body;

//     const decoded = jwtDecode(token);
//     if (!decoded.sub || !decoded.email || !decoded.name) {
//       return res.status(400).json({ error: "Invalid Google token" });
//     }

//     const userData = {
//       googleId: decoded.sub,
//       name: decoded.name,
//       email: decoded.email,
//       picture: decoded.picture,
//       country: "India",
//     };

//     let user = await User.findOne({ googleId: decoded.sub });

//     if (!user) {
//       user = new User(userData);
//       await user.save();
//     } else {
//       user.lastLogin = Date.now();
//       user.country = user.country || userData.country; // Save country if not already set
//       await user.save();
//     }

//     const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "24h",
//     });

//     res.json({
//       token: jwtToken,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         picture: user.picture,
//         country: user.country,
//         mobile: user.mobile,
//       },
//     });
//   } catch (error) {
//     console.error("Google login error:", error);
//     res.status(500).json({
//       error: "Authentication failed",
//       details: error.message,
//     });
//   }
// };

// export const updateMobile = async (req, res) => {
//   try {
//     const { userId } = req.user;
//     const { mobile } = req.body;

//     // Validate mobile number format if needed
//     const digits = String(mobile || "").replace(/\D/g, "");
//     if (digits.length < 10 || digits.length > 15) {
//       return res.status(400).json({ error: "Invalid mobile number" });
//     }

//     const normalized = digits;
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { mobile: normalized },
//       { new: true, runValidators: true, context: "query" }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json({
//       user: {
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         picture: updatedUser.picture,
//         country: updatedUser.country,
//         mobile: updatedUser.mobile,
//       },
//     });
//   } catch (error) {
//     if (error?.code === 11000 && error?.keyPattern?.mobile) {
//       return res
//         .status(409)
//         .json({
//           error: "This mobile number is already linked to another account.",
//         });
//     }
//     console.error("Mobile update error:", error);
//     return res.status(500).json({ error: "Failed to update mobile number" });
//   }
// };

// export const updateCountry = async (req, res) => {
//   try {
//     const { userId } = req.user;
//     const { country } = req.body;

//     if (!country) {
//       return res.status(400).json({ error: "Country is required" });
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { country },
//       { new: true, runValidators: true, context: "query" }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json({
//       user: {
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         picture: updatedUser.picture,
//         country: updatedUser.country,
//         mobile: updatedUser.mobile,
//       },
//     });
//   } catch (error) {
//     console.error("Country update error:", error);
//     return res.status(500).json({ error: "Failed to update country" });
//   }
// };

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import otpStore from "../models/otpStore.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import axios from "axios";

const AVATARS = [
  "/avatars/dragon.png",
  "/avatars/space.png",
  "/avatars/cheerful.png",
  "/avatars/galaxy.png",
  "/avatars/warrior.png",
  "/avatars/wizard.png",
  "/avatars/dual.png",
];

function getRandomAvatar() {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

/// Configure Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmail(toEmail, subject, text) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: toEmail,
    subject,
    text,
  };
  await transporter.sendMail(mailOptions);
}

const OTP_EXPIRY_MINUTES = 10;

const TWOFACTOR_API_KEY = process.env.TWOFACTOR_API_KEY;

function formatNumberFor2Factor(number) {
  if (!number) return number;
  return number.startsWith("+") ? number.substring(1) : number;
}

export async function sendVerificationOtp({
  deliveryMethod,
  identifierValue,
  otp,
}) {
  if (!["sms", "email"].includes(deliveryMethod))
    throw new Error("Invalid delivery method");

  if (deliveryMethod === "sms") {
    const formattedNumber = formatNumberFor2Factor(identifierValue);
    const url = `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/${formattedNumber}/AUTOGEN/user-register-template`;
    const resp = await axios.get(url);


    if (resp.data.Status !== "Success") {
      throw new Error("Failed to send OTP");
    }

    if (resp.data.Details?.includes("CALL")) {
      console.warn("⚠️ 2Factor used CALL fallback instead of SMS!");
    }

    return {
      message: `OTP sent to mobile: ${identifierValue}`,
      txnId: resp.data.Details,
    };
  }

  // email flow unchanged
  if (!otp) throw new Error("OTP required for email delivery");
  await sendEmail(
    identifierValue,
    "Your Verification OTP",
    `Your OTP code is: ${otp}`
  );
  return { message: `OTP sent to email: ${identifierValue}` };
}

export const register = async (req, res) => {
  try {
    const { name, email, mobile, password, deliveryMethod } = req.body;

    if (!name || !password || !deliveryMethod || (!email && !mobile)) {
      return res
        .status(400)
        .json({ message: "Insufficient details or missing delivery method" });
    }

    if (!["email", "sms"].includes(deliveryMethod)) {
      return res.status(400).json({ message: "Invalid delivery method" });
    }

    let existingUser = null;
    if (email) existingUser = await User.findOne({ email });
    if (!existingUser && mobile) existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with given email or mobile already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let country = null;
    if (mobile) {
      // parsePhoneNumberFromString expects + prefixed number, so unchanged
      const phoneNumber = parsePhoneNumberFromString(mobile);

      if (phoneNumber) country = phoneNumber.country;
    }

    let identifierType, identifierValue;
    if (deliveryMethod === "sms" && mobile) {
      identifierType = "mobile";
      identifierValue = mobile;
    } else if (deliveryMethod === "email" && email) {
      identifierType = "email";
      identifierValue = email;
    } else {
      return res
        .status(400)
        .json({ message: "Identifier required for the delivery method" });
    }

    const filter = {
      "identifier.type": identifierType,
      "identifier.value": identifierValue,
      reason: "userRegistration",
      deliveryMethod,
    };

    const baseSet = {
      name,
      email,
      mobile,
      password: hashedPassword,
      country,
      updatedAt: new Date(),
    };

    const baseSetOnInsert = {
      identifier: { type: identifierType, value: identifierValue },
      reason: "userRegistration",
      deliveryMethod,
      createdAt: new Date(),
    };

    const expiry = new Date(
      Date.now() +
        (typeof OTP_EXPIRY_MINUTES === "number" ? OTP_EXPIRY_MINUTES : 10) *
          60 *
          1000
    );

    let emailOtp = null;
    if (deliveryMethod === "email") {
      emailOtp = generateOTP();
      baseSet.otp = emailOtp;
      baseSet.expiry = expiry;
    } else {
      baseSet.expiry = expiry;
    }

    await otpStore.updateOne(
      filter,
      { $set: baseSet, $setOnInsert: baseSetOnInsert },
      { upsert: true }
    );

    if (deliveryMethod === "email") {
      await sendVerificationOtp({
        deliveryMethod: "email",
        identifierValue: email,
        otp: emailOtp,
      });
    } else {
      const sendResp = await sendVerificationOtp({
        deliveryMethod: "sms",
        identifierValue: mobile,
      });

      await otpStore.updateOne(filter, { $set: { txnId: sendResp.txnId } });
    }

    return res.status(200).json({
      message:
        deliveryMethod === "email" ? "OTP sent to email" : "OTP sent to mobile",
      name,
      country,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { otp, deliveryMethod, identifierValue } = req.body;

    if (!deliveryMethod || !identifierValue) {
      return res
        .status(400)
        .json({ message: "deliveryMethod and identifierValue are required" });
    }
    if (!["email", "sms"].includes(deliveryMethod)) {
      return res.status(400).json({ message: "Invalid delivery method" });
    }

    const tempRecord = await otpStore.findOne({
      "identifier.value": identifierValue,
      deliveryMethod,
      reason: "userRegistration",
    });
    if (!tempRecord) {
      return res
        .status(404)
        .json({ message: "Temporary record not found or expired" });
    }

    if (deliveryMethod === "sms") {
      if (!otp) {
        return res
          .status(400)
          .json({ message: "OTP is required for SMS verification" });
      }
      const { txnId } = tempRecord;
      if (!txnId) {
        return res
          .status(400)
          .json({ message: "Transaction ID missing for SMS verification" });
      }
      const url = `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/VERIFY/${txnId}/${otp}`;
      const resp = await axios.get(url);
      if (
        resp.data.Status !== "Success" ||
        resp.data.Details !== "OTP Matched"
      ) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
    } else if (deliveryMethod === "email") {
      if (!otp) {
        return res
          .status(400)
          .json({ message: "OTP is required for email verification" });
      }
      if (
        tempRecord.otp !== otp ||
        !tempRecord.expiry ||
        tempRecord.expiry < new Date()
      ) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
    }

    const existingUser = await User.findOne({
      $or: [{ email: tempRecord.email }, { mobile: tempRecord.mobile }],
    });
    if (existingUser) {
      await otpStore.deleteMany({
        "identifier.value": identifierValue,
        deliveryMethod,
        reason: "userRegistration",
      });
      return res.status(409).json({ message: "User already registered" });
    }

    const newUser = new User({
      name: tempRecord.name,
      email: tempRecord.email,
      mobile: tempRecord.mobile,
      password: tempRecord.password,
      country: tempRecord.country,
      verified: true,
      picture: getRandomAvatar(),
    });
    await newUser.save();

    await otpStore.deleteMany({
      "identifier.value": identifierValue,
      deliveryMethod,
      reason: "userRegistration",
    });

    return res
      .status(200)
      .json({ message: "User verified and registered successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "OTP verification failed", error: err.message });
  }
};

const generateNewOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const resendOtp = async (req, res) => {
  try {
    const { identifierValue, deliveryMethod } = req.body;

    if (!identifierValue || !deliveryMethod) {
      return res
        .status(400)
        .json({ message: "identifierValue and deliveryMethod are required" });
    }
    if (!["email", "sms"].includes(deliveryMethod)) {
      return res.status(400).json({ message: "Invalid delivery method" });
    }

    const identifierType = deliveryMethod === "sms" ? "mobile" : "email";

    const filter = {
      "identifier.type": identifierType,
      "identifier.value": identifierValue,
      deliveryMethod,
      reason: "userRegistration",
    };

    const doc = await otpStore.findOne(filter);
    if (!doc) {
      return res.status(404).json({ message: "No OTP record found to resend" });
    }

    const newOtp = generateNewOtp();
    const newExpiry = new Date(
      Date.now() +
        (typeof OTP_EXPIRY_MINUTES === "number" ? OTP_EXPIRY_MINUTES : 10) *
          60 *
          1000
    );

    const update = {
      $set: { otp: newOtp, expiry: newExpiry, updatedAt: new Date() },
    };

    if (deliveryMethod === "sms") {
      const sendResp = await sendVerificationOtp({
        deliveryMethod,
        identifierValue,
      });
      update.$set.txnId = sendResp.txnId;
    }

    const result = await otpStore.updateOne(filter, update, { upsert: false });
    if (result.matchedCount !== 1) {
      return res.status(409).json({ message: "OTP record changed, retry" });
    }

    if (deliveryMethod === "email") {
      await sendVerificationOtp({
        deliveryMethod,
        identifierValue,
        otp: newOtp,
      });
    }

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to resend OTP", error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, mobile, deliveryMethod } = req.body;

    if (
      !deliveryMethod ||
      (deliveryMethod === "email" && !email) ||
      (deliveryMethod === "sms" && !mobile)
    ) {
      return res.status(400).json({
        message: "Delivery method and respective identifier are required",
      });
    }
    if (!["email", "sms"].includes(deliveryMethod)) {
      return res.status(400).json({ message: "Invalid delivery method" });
    }

    const identifierType = deliveryMethod === "sms" ? "mobile" : "email";
    const identifierValue = deliveryMethod === "sms" ? mobile : email;

    const user = await User.findOne({ $or: [{ email }, { mobile }] });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const filter = {
      "identifier.type": identifierType,
      "identifier.value": identifierValue,
      reason: "resetPassword",
      deliveryMethod,
    };

    const expiry = new Date(
      Date.now() +
        (typeof OTP_EXPIRY_MINUTES === "number" ? OTP_EXPIRY_MINUTES : 10) *
          60 *
          1000
    );

    if (deliveryMethod === "email") {
      const emailOtp = generateOTP();
      await otpStore.updateOne(
        filter,
        {
          $set: {
            otp: emailOtp,
            expiry,
            userId: user._id.toString(),
            updatedAt: new Date(),
          },
          $setOnInsert: {
            identifier: { type: identifierType, value: identifierValue },
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      const resp = await sendVerificationOtp({
        deliveryMethod: "email",
        identifierValue: email,
        otp: emailOtp,
      });

      return res
        .status(200)
        .json({ message: resp?.message || "Reset OTP sent to email" });
    }

    await otpStore.updateOne(
      filter,
      {
        $set: {
          expiry,
          userId: user._id.toString(),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          identifier: { type: identifierType, value: identifierValue },
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    const resp = await sendVerificationOtp({
      deliveryMethod: "sms",
      identifierValue: mobile,
    });
    await otpStore.updateOne(filter, { $set: { txnId: resp.txnId } });

    return res
      .status(200)
      .json({ message: resp?.message || "Reset OTP sent to mobile" });
  } catch (err) {
    return res
      .status(500)
      .json({
        message: "Failed to send password reset OTP",
        error: err.message,
      });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, mobile, otp, newPassword, deliveryMethod } = req.body;

    if (!otp || !newPassword || !deliveryMethod || (!email && !mobile)) {
      return res.status(400).json({ message: "Required fields missing" });
    }
    if (!["email", "sms"].includes(deliveryMethod)) {
      return res.status(400).json({ message: "Invalid delivery method" });
    }

    const user = await User.findOne({ $or: [{ email }, { mobile }] });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (deliveryMethod === "sms") {
      const identifierValue = mobile;
      const tempRecord = await otpStore.findOne({
        "identifier.value": identifierValue,
        deliveryMethod,
        reason: "resetPassword",
      });
      if (!tempRecord || !tempRecord.txnId) {
        return res
          .status(400)
          .json({ message: "Transaction ID missing for SMS verification" });
      }
      const { txnId } = tempRecord;
      const url = `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/VERIFY/${txnId}/${otp}`;
      const resp = await axios.get(url);
      if (
        resp.data.Status !== "Success" ||
        resp.data.Details !== "OTP Matched"
      ) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Delete temp OTP record after successful SMS OTP verification
      await otpStore.deleteOne({ _id: tempRecord._id });
    } else if (deliveryMethod === "email") {
      const otpDoc = await otpStore.findOne({
        userId: user._id.toString(),
        otp,
        reason: "resetPassword",
        expiry: { $gt: new Date() },
        "identifier.value": email,
        deliveryMethod: "email",
      });

      if (!otpDoc) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      await otpStore.deleteOne({ _id: otpDoc._id });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    if (!user.verified) user.verified = true;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Password reset failed", error: err.message });
  }
};

function generateSessionToken(payload, expiresIn = "15m") {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

function generateRefreshToken(payload, expiresIn = "30d") {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn });
}

export const login = async (req, res) => {
  try {
    const { email, mobile, password, deviceName, browser, userAgent } =
      req.body;

    if ((!email && !mobile) || !password) {
      return res
        .status(400)
        .json({ message: "Email or mobile and password are required" });
    }

    const user = await User.findOne({ $or: [{ email }, { mobile }] });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.password)
      return res.status(401).json({ message: "Password login not enabled" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const sessionTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const sessionToken = generateSessionToken({ userId: user._id });
    const refreshToken = generateRefreshToken({ userId: user._id });

    // Check for existing token entry for this device and browser
    const existingTokenIndex = user.authTokens.findIndex(
      (t) => t.deviceName === deviceName && t.browser === browser
    );

    if (existingTokenIndex !== -1) {
      // Update existing token entry
      user.authTokens[existingTokenIndex] = {
        deviceName,
        browser,
        userAgent,
        sessionToken,
        sessionTokenExpiry,
        refreshToken,
        refreshTokenExpiry,
        loggedIn: true,
        lastLogin: new Date(),
      };
    } else {
      // Add new token entry
      user.authTokens.push({
        deviceName,
        browser,
        userAgent,
        sessionToken,
        sessionTokenExpiry,
        refreshToken,
        refreshTokenExpiry,
        loggedIn: true,
        lastLogin: new Date(),
      });
    }

    await user.save();

    // Set refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", 
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      sessionToken,
      deviceName,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        country: user.country,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Login failed", error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { email, deviceName } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token missing" });
    }
    if (!email || !deviceName) {
      return res
        .status(400)
        .json({ message: "Email and device name required for logout" });
    } // Find user by email

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    } // Find token entry index by deviceName and refreshToken

    const tokenIndex = user.authTokens.findIndex(
      (t) => t.deviceName === deviceName && t.refreshToken === refreshToken
    );
    if (tokenIndex === -1) {
      return res.status(404).json({ message: "Session not found" });
    } // Option 1: Mark loggedIn false (keep record)

    user.authTokens[tokenIndex].loggedIn = false;

    await user.save(); // Clear refresh token cookie

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none", 
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
};

// export const forgotPassword = async (req, res) => {
//   try {
//     const { email, mobile, deliveryMethod } = req.body;

//     if (
//       !deliveryMethod ||
//       (deliveryMethod === "email" && !email) ||
//       (deliveryMethod === "sms" && !mobile)
//     ) {
//       return res.status(400).json({
//         message: "Delivery method and respective identifier are required",
//       });
//     }
//     if (!["email", "sms"].includes(deliveryMethod)) {
//       return res.status(400).json({ message: "Invalid delivery method" });
//     }

//     const identifierType = deliveryMethod === "sms" ? "mobile" : "email";
//     const identifierValue = deliveryMethod === "sms" ? mobile : email;

//     const user = await User.findOne({ $or: [{ email }, { mobile }] });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const filter = {
//       "identifier.type": identifierType,
//       "identifier.value": identifierValue,
//       reason: "resetPassword",
//       deliveryMethod,
//     };

//     const expiry = new Date(
//       Date.now() +
//         (typeof OTP_EXPIRY_MINUTES === "number" ? OTP_EXPIRY_MINUTES : 10) *
//           60 *
//           1000
//     );

//     if (deliveryMethod === "email") {
//       const emailOtp = generateOTP();
//       await otpStore.updateOne(
//         filter,
//         {
//           $set: {
//             otp: emailOtp,
//             expiry,
//             userId: user._id.toString(),
//             updatedAt: new Date(),
//           },
//           $setOnInsert: {
//             identifier: { type: identifierType, value: identifierValue },
//             createdAt: new Date(),
//           },
//         },
//         { upsert: true }
//       );

//       const resp = await sendVerificationOtp({
//         deliveryMethod: "email",
//         identifierValue: email,
//         otp: emailOtp,
//       });

//       return res
//         .status(200)
//         .json({ message: resp?.message || "Reset OTP sent to email" });
//     }

//     // SMS flow: Twilio Verify handles OTP generation
//     await otpStore.updateOne(
//       filter,
//       {
//         $set: {
//           expiry,
//           userId: user._id.toString(),
//           updatedAt: new Date(),
//         },
//         $setOnInsert: {
//           identifier: { type: identifierType, value: identifierValue },
//           createdAt: new Date(),
//         },
//       },
//       { upsert: true }
//     );

//     const resp = await sendVerificationOtp({
//       deliveryMethod: "sms",
//       identifierValue: mobile,
//     });

//     return res
//       .status(200)
//       .json({ message: resp?.message || "Reset OTP sent to mobile" });
//   } catch (err) {
//     return res.status(500).json({
//       message: "Failed to send password reset OTP",
//       error: err.message,
//     });
//   }
// };

// export const resetPassword = async (req, res) => {
//   try {
//     const { email, mobile, otp, newPassword, deliveryMethod } = req.body;

//     if (!otp || !newPassword || !deliveryMethod || (!email && !mobile)) {
//       return res.status(400).json({ message: "Required fields missing" });
//     }
//     if (!["email", "sms"].includes(deliveryMethod)) {
//       return res.status(400).json({ message: "Invalid delivery method" });
//     }

//     const user = await User.findOne({ $or: [{ email }, { mobile }] });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (deliveryMethod === "sms") {
//       const verificationCheck = await client.verify.v2
//         .services(process.env.TWILIO_VERIFY_SID)
//         .verificationChecks.create({ to: mobile, code: otp });

//       if (verificationCheck.status !== "approved") {
//         return res.status(400).json({ message: "Invalid or expired OTP" });
//       }
//     } else if (deliveryMethod === "email") {
//       const otpDoc = await otpStore.findOne({
//         userId: user._id.toString(),
//         otp,
//         reason: "resetPassword",
//         expiry: { $gt: new Date() },
//         "identifier.value": email,
//         deliveryMethod: "email",
//       });

//       if (!otpDoc) {
//         return res.status(400).json({ message: "Invalid or expired OTP" });
//       }

//       await otpStore.deleteOne({ _id: otpDoc._id });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;
//     if (!user.verified) user.verified = true;
//     await user.save();

//     return res.status(200).json({ message: "Password reset successful" });
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ message: "Password reset failed", error: err.message });
//   }
// };

// ================== REFRESH SESSION ==================
export const refreshSession = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if refresh token exists in user's active tokens
    const tokenEntry = user.authTokens.find(
      (t) => t.refreshToken === refreshToken && t.loggedIn
    );
    if (!tokenEntry) {
      return res.status(401).json({ message: "Session invalidated" });
    }

    // Issue new short-lived session token
    const sessionToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    tokenEntry.sessionToken = sessionToken;
    tokenEntry.sessionTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    return res.status(200).json({
      message: "Session refreshed",
      sessionToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        country: user.country,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    console.error("Refresh session error:", err);
    return res.status(500).json({ message: "Failed to refresh session" });
  }
};

// export const updateAvatar = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const { picture } = req.body;

//     if (!picture) return res.status(400).json({ message: "Picture required" });

//     const user = await User.findByIdAndUpdate(
//       userId,
//       { picture },
//       { new: true }
//     ).select("-password -authTokens");

//     return res.json({ message: "Avatar updated", user });
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ message: "Failed to update avatar", error: err.message });
//   }
// };
