import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  addStatusUpdate,
  getClientByEmail,
  getClientByPhone,
  deleteOrder,
  generateTrackingLink,
  getOrderByTrackingToken
} from '../controllers/orderController.js';
import upload from '../../utils/multer.js';

const router = express.Router();

// ✅ Create order with files
router.post('/', upload.array('files'), createOrder);

// ✅ Get all orders or by client email/phone
router.get('/', getOrders);
router.get('/client-by-email', getClientByEmail);
router.get('/client-by-phone', getClientByPhone);


// ✅ Generate tracking link for a specific order (Admin use)
router.get('/:id/generate-tracking-link', generateTrackingLink);



// ✅ Public endpoint to get order info by tracking token (Client use)
// Must come before :id route to avoid conflict
router.get('/track/:trackingToken', getOrderByTrackingToken);



// ✅ Get single order by ID
router.get('/:id', getOrderById);

// ✅ Update order
router.put('/:id', updateOrder);

// ✅ Update status
router.patch('/:id/status', upload.array('images'), addStatusUpdate);

// ✅ Delete order
router.delete('/:id', deleteOrder);

export default router;
