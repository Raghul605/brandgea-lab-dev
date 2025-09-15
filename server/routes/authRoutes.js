import express from 'express';
import { googleLogin, updateCountry, updateMobile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/google', googleLogin);
router.put('/update-mobile', protect, updateMobile);
router.put('/update-country', protect, updateCountry);

export default router;