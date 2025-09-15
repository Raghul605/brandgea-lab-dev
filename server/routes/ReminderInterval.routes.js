import express from 'express';
import { createReminderInterval } from '../controllers/ReminderInterval.controller.js';

const router = express.Router();

router.post('/reminder-intervals', createReminderInterval);

export default router;
