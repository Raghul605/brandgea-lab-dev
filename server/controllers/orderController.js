// controllers/orderController.js
import Order from '../admin/models/order.js'; 

// GET /orders/by-email?email=abc@example.com
export const getOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const orders = await Order.find({ 'client.email': email })
      .sort({ createdAt: -1 })  
      .select('_id serviceType product.garmentType product.totalQuantity product.totalLotValue files status.currentStatus createdAt updatedAt'); 

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /orders/by-user/:userId
export const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const orders = await Order.find({ 'client.userId': userId })
      .sort({ createdAt: -1 })
      .select('_id serviceType product.garmentType product.totalQuantity product.totalLotValue files status.currentStatus createdAt updatedAt');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /orders/:id
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
