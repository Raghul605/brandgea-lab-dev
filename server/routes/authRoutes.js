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


const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forget-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/refresh", refreshSession);


export default router;