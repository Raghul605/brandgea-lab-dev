// import express from 'express';
// import { googleLogin, updateCountry, updateMobile } from '../controllers/authController.js';
// import { protect } from '../middleware/authMiddleware.js';

// const router = express.Router();

// router.post('/google', googleLogin);
// router.put('/update-mobile', protect, updateMobile);
// router.put('/update-country', protect, updateCountry);

// export default router;

import express from "express";
import {
 
  register,
  verifyOtp,
  resendOtp,
  login,
  logout,
  resetPassword,
  forgotPassword,
  refreshSession,
  
} from "../controllers/authController.js";
// import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// router.post("/google", googleLogin);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forget-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/refresh", refreshSession);
// router.put("/update-avatar", updateAvatar);

export default router;