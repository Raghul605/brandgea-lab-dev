import express from "express";
import {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendorById,
  deleteVendorById,
  changeVendorStatus,
} from "../controllers/vendorManagementControllers.js";

const router = express.Router();

router.post("/vendors", createVendor);
router.get("/vendors", getAllVendors);
router.get("/vendors/:id", getVendorById);
router.put("/vendors/:id", updateVendorById); // full or partial update allowed
router.delete("/vendors/:id", deleteVendorById);
router.patch("/vendors/:id/status", changeVendorStatus); // dedicated status change route

export default router;
