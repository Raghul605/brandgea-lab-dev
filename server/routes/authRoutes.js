import express from 'express';
import { googleLogin, updateMobile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/google', googleLogin);
router.put('/update-mobile', protect, updateMobile);

export default router;