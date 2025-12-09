import TempLeadStore from "../../models/tempLeadStoreModel.js";
import uploadImages from "../../utils/s3Upload.js";
import { createLeadAutomated } from "../controllers/leadManagementController.js";

export async function createLead(req, res) {
  try {
    // Parse uploaded images (assume multer middleware has populated req.files)
    const imageFiles = req.files || [];

    // Upload images to S3 and collect URLs
    const referenceimages = await uploadImages(imageFiles);

    // Extract request body fields, including LTVM_Automated with fallback false
    const {
      CustomerName,
      CustomerMobile,
      CustomerEmail,
      leadTitle,
      Requirement,
      userId,
      chatId,
      ManufacturerFindTransactionId,
      Quantity,
      TargetCost,
      TargetTAT,
      number_of_recieved_quotes,
      max_number_of_allowed_quotes,
      LTVM_Automated = false,
    } = req.body;

    // Basic required field validation
    if (
      !CustomerName ||
      !CustomerMobile ||
      !CustomerEmail ||
      !leadTitle ||
      !Requirement
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided." });
    }

    // Create temporary lead document
    const newTempLead = await TempLeadStore.create({
      CustomerName,
      CustomerMobile,
      CustomerEmail,
      leadTitle,
      Requirement:
        typeof Requirement === "string" ? JSON.parse(Requirement) : Requirement,
      referenceimages,
      doc_created_by: "user",
      userId,
      chatId,
      ManufacturerFindTransactionId,
      Quantity: Number(Quantity),
      TargetCost: Number(TargetCost),
      TargetTAT: Number(TargetTAT),
      number_of_recieved_quotes: number_of_recieved_quotes
        ? Number(number_of_recieved_quotes)
        : 0,
      max_number_of_allowed_quotes: max_number_of_allowed_quotes
        ? Number(max_number_of_allowed_quotes)
        : 5,
      LTVM_Automated,
    });

    // If LTVM_Automated is true, create permanent lead and let createLeadAutomated handle temp lead deletion
    if (LTVM_Automated === true || LTVM_Automated === "true") {
      try {
        const leadData = {
          CustomerName,
          CustomerMobile,
          CustomerEmail,
          leadTitle,
          Requirement:
            typeof Requirement === "string"
              ? JSON.parse(Requirement)
              : Requirement,
          referenceimages,
          Quantity: Number(Quantity),
          TargetCost: Number(TargetCost),
          TargetTAT: Number(TargetTAT),
          additionalImagesOrDocs: [], // Add if applicable from req.body
          intentScore: undefined, // Add if applicable
          max_number_of_allowed_quotes: max_number_of_allowed_quotes
            ? Number(max_number_of_allowed_quotes)
            : 5,
          userId,
          chatId,
          TempLeadStoreid: newTempLead._id, // pass temp lead id for deletion inside createLeadAutomated
        };

        const permanentLead = await createLeadAutomated(leadData);

        return res
          .status(201)
          .json({
            success: true,
            data: permanentLead,
            message: "Permanent lead created from temp lead.",
          });
      } catch (error) {
        console.error("Permanent lead creation failed:", error);
        return res
          .status(500)
          .json({
            error: "Temp lead created but failed to create permanent lead",
            details: error.message,
          });
      }
    }

    // If LTVM_Automated is false, just return temp lead response
    return res.status(201).json({ success: true, data: newTempLead });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function getAllLeads(req, res) {
  try {
    // Select only _id and leadTitle fields
    const leads = await TempLeadStore.find({}, "_id leadTitle CustomerName CustomerMobile CustomerEmail");
    return res.status(200).json({ success: true, data: leads });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function getLeadById(req, res) {
  try {
    const { id } = req.params;
    const lead = await TempLeadStore.findById(id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    return res.status(200).json({ success: true, data: lead });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      // If invalid ObjectId format
      return res.status(400).json({ error: "Invalid lead ID" });
    }
    return res.status(500).json({ error: "Server error" });
  }
}

export async function deleteLeadById(req, res) {
  try {
    const { id } = req.params;
    const deletedLead = await TempLeadStore.findByIdAndDelete(id);
    if (!deletedLead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Lead deleted successfully" });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid lead ID" });
    }
    return res.status(500).json({ error: "Server error" });
  }
}
