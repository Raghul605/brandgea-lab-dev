import express from "express";
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadById,
  deleteLeadById,
  getActiveLeadDetails,
  testProcessLeadTransactions,
  checkVendorLeadEligibility
} from "../controllers/leadManagementController.js";

const router = express.Router();

router.post("/leads", createLead);
router.get("/leads", getAllLeads);
router.get("/leads/:id", getLeadById);
router.put("/leads/:id", updateLeadById); 
router.delete("/leads/:id", deleteLeadById);
router.get("/leads/active-lead-details/:LeadID", getActiveLeadDetails);
router.get("/test-process-leads", testProcessLeadTransactions);
router.get("/check-vendor-eligibility/:vendorEmail/:leadId", checkVendorLeadEligibility);//for verify(email + leadid)

export default router;
