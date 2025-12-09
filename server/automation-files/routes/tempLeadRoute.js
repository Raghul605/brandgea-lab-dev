import express from "express";
import multer from "multer";
import {
  createLead,
  getAllLeads,
  getLeadById,
  deleteLeadById
} from "../controllers/tempLeadController.js";

const upload = multer(); // You can configure storage if needed

const router = express.Router();

// This expects files uploaded as 'referenceimages'
router.post("/lead", upload.array("referenceimages"), createLead);
router.get("/leads", getAllLeads);
router.get("/leads/:id", getLeadById);
router.delete("/delete_lead/:id", deleteLeadById);

export default router;
