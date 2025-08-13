import express from 'express';
import { sendManufacturingEmail  } from '../controllers/emailController.js';

const router = express.Router();

router.post("/manufacturing", sendManufacturingEmail);

export default router;