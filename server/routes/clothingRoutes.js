import express from "express";
import multer from "multer";
import { validateClothing } from "../controllers/clothingController.js";
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),  
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
});

// Main endpoint
router.post("/validate", protect, upload.array("images", 2), validateClothing);

export default router;