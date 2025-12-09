import LeadManagement from "../../models/LeadToVendorManagementModel.js";
import TempLeadStore from "../../models/tempLeadStoreModel.js";
import ActiveLeads from "../../models/ActiveLeadsModel.js";
import processLeadTransactions from "../../utils/processLeadTransactions.js";
import VendorDetails from "../../models/vendorDetailsModel.js";

// Helper function to validate URLs
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

//create new lead
export const createLead = async (req, res) => {
  try {
    const {
      CustomerName,
      CustomerMobile,
      CustomerEmail,
      leadTitle,
      Requirement,
      referenceimages,
      Quantity,
      TargetCost,
      TargetTAT,
      additionalImagesOrDocs,
      intentScore,
      max_number_of_allowed_quotes,
      userId,
      chatId,
      TempLeadStoreid,
    } = req.body;

    // Validate mandatory fields (no LeadID)
    if (
      !CustomerName ||
      !CustomerMobile ||
      !CustomerEmail ||
      !leadTitle ||
      !Requirement ||
      Quantity === undefined ||
      TargetCost === undefined ||
      !TargetTAT
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Construct the data without LeadID
    const leadData = {
      CustomerName,
      CustomerMobile,
      CustomerEmail: CustomerEmail.toLowerCase(),
      leadTitle,
      Requirement,
      referenceimages,
      Quantity,
      TargetCost,
      TargetTAT,
      additionalImagesOrDocs,
      intentScore,
      max_number_of_allowed_quotes,
      userId,
      chatId,
    };

    // Create and save, LeadID will be generated automatically via pre-save hook
    const newLead = new LeadManagement(leadData);
    const savedLead = await newLead.save();

    // Create entry in ActiveLeads collection with lead_status_active default true
    await ActiveLeads.create({
      Lead_Doc_Id: savedLead._id,
      LeadID: savedLead.LeadID,
      userId: savedLead.userId,
      lead_status_active: true,
      createdAt: new Date(),
    });

    // Delete temp lead document if TempLeadStoreid provided
    if (TempLeadStoreid) {
      await TempLeadStore.findByIdAndDelete(TempLeadStoreid);
    }

    res.status(201).json(savedLead);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: "Validation Error", errors: messages });
    }
    res.status(500).json({ message: "Failed to create lead", error: error.message });
  }
};

// export const createLead = async (req, res) => {
//   try {
//     const {
//       CustomerName,
//       CustomerMobile,
//       CustomerEmail,
//       leadTitle,
//       Requirement,
//       referenceimages,
//       Quantity,
//       TargetCost,
//       TargetTAT,
//       additionalImagesOrDocs,
//       intentScore,
//       max_number_of_allowed_quotes,
//       userId,
//       chatId,
//       TempLeadStoreid,
//     } = req.body;

//     // Validate mandatory fields (no LeadID)
//     if (
//       !CustomerName ||
//       !CustomerMobile ||
//       !CustomerEmail ||
//       !leadTitle ||
//       !Requirement ||
//       Quantity === undefined ||
//       TargetCost === undefined ||
//       !TargetTAT
//     ) {
//       return res.status(400).json({ message: "Missing required fields." });
//     }

//     // Construct the data without LeadID
//     const leadData = {
//       CustomerName,
//       CustomerMobile,
//       CustomerEmail: CustomerEmail.toLowerCase(),
//       leadTitle,
//       Requirement,
//       referenceimages,
//       Quantity,
//       TargetCost,
//       TargetTAT,
//       additionalImagesOrDocs,
//       intentScore,
//       max_number_of_allowed_quotes,
//       userId,
//       chatId,
//     };

//     // Create and save, LeadID will be generated automatically via pre-save hook
//     const newLead = new LeadManagement(leadData);
//     const savedLead = await newLead.save();

//     // Delete temp lead document if TempLeadStoreid provided
//     if (TempLeadStoreid) {
//       await TempLeadStore.findByIdAndDelete(TempLeadStoreid);
//     }

//     res.status(201).json(savedLead);
//   } catch (error) {
//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((val) => val.message);
//       return res
//         .status(400)
//         .json({ message: "Validation Error", errors: messages });
//     }
//     res
//       .status(500)
//       .json({ message: "Failed to create lead", error: error.message });
//   }
// };

export async function createLeadAutomated(data) {
  try {
    const {
      CustomerName,
      CustomerMobile,
      CustomerEmail,
      leadTitle,
      Requirement,
      referenceimages,
      Quantity,
      TargetCost,
      TargetTAT,
      additionalImagesOrDocs,
      intentScore,
      max_number_of_allowed_quotes,
      userId,
      chatId,
      TempLeadStoreid,
    } = data;

    // Validate mandatory fields (no LeadID since auto-generated)
    if (
      !CustomerName ||
      !CustomerMobile ||
      !CustomerEmail ||
      !leadTitle ||
      !Requirement ||
      Quantity === undefined ||
      TargetCost === undefined ||
      !TargetTAT
    ) {
      throw { status: 400, message: "Missing required fields." };
    }

    // Construct lead data object
    const leadData = {
      CustomerName,
      CustomerMobile,
      CustomerEmail: CustomerEmail.toLowerCase(),
      leadTitle,
      Requirement,
      referenceimages,
      Quantity,
      TargetCost,
      TargetTAT,
      additionalImagesOrDocs,
      intentScore,
      max_number_of_allowed_quotes,
      userId,
      chatId,
    };

    const newLead = new LeadManagement(leadData);
    const savedLead = await newLead.save();

    // Create entry in ActiveLeads collection with lead_status_active default true
    await ActiveLeads.create({
      Lead_Doc_Id: savedLead._id,
      LeadID: savedLead.LeadID,
      userId: savedLead.userId,
      lead_status_active: true,
      createdAt: new Date(),
    });

    // Delete TempLeadStore doc if id provided
    if (TempLeadStoreid) {
      await TempLeadStore.findByIdAndDelete(TempLeadStoreid);
    }

    return savedLead;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw {
      status: 500,
      message: "Failed to create lead",
      error: error.message,
    };
  }
}

// GET all leads (with optional status, CustomerEmail, CustomerMobile filter)
// Only returns selected key details for list views, can add pagination if needed
export const getAllLeads = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status; // If you add status
    if (req.query.CustomerEmail)
      filter.CustomerEmail = req.query.CustomerEmail.toLowerCase();
    if (req.query.CustomerMobile)
      filter.CustomerMobile = req.query.CustomerMobile.trim();
    if (req.query.LeadID) filter.LeadID = req.query.LeadID.trim();

    // Only select summary fields
    const leads = await LeadManagement.find(filter).select(
      "_id LeadID CustomerName CustomerEmail CustomerMobile leadTitle createdAt number_of_recieved_quotes"
    );

    res.status(200).json(leads);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch leads", error: error.message });
  }
};

// GET lead by ID
export const getLeadById = async (req, res) => {
  try {
    const lead = await LeadManagement.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json(lead);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch lead", error: error.message });
  }
};

// UPDATE lead by ID (excludes vendor_quotes field)
export const updateLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // Prevent updating vendor_quotes here (if exists)
    if (updateData.vendor_quotes) delete updateData.vendor_quotes;

    // Validate LeadID uniqueness if updating
    if (updateData.LeadID) {
      const existing = await LeadManagement.findOne({
        LeadID: updateData.LeadID.trim(),
        _id: { $ne: id },
      });
      if (existing) {
        return res
          .status(409)
          .json({
            message: "LeadID already exists. Please use a different LeadID.",
          });
      }
      updateData.LeadID = updateData.LeadID.trim();
    }

    // Normalize CustomerEmail if updated
    if (updateData.CustomerEmail) {
      updateData.CustomerEmail = updateData.CustomerEmail.toLowerCase();
    }

    // Validate referenceimages array if provided
    if (updateData.referenceimages !== undefined) {
      if (
        !Array.isArray(updateData.referenceimages) ||
        updateData.referenceimages.length === 0
      ) {
        return res
          .status(400)
          .json({
            message:
              "referenceimages must be a non-empty array of URLs if provided",
          });
      }
      for (const url of updateData.referenceimages) {
        if (!isValidUrl(url)) {
          return res
            .status(400)
            .json({ message: `Invalid URL in referenceimages: ${url}` });
        }
      }
    }

    // Validate additionalImagesOrDocs array if provided
    if (updateData.additionalImagesOrDocs !== undefined) {
      if (
        !Array.isArray(updateData.additionalImagesOrDocs) ||
        updateData.additionalImagesOrDocs.length === 0
      ) {
        return res
          .status(400)
          .json({
            message:
              "additionalImagesOrDocs must be a non-empty array of URLs if provided",
          });
      }
      for (const url of updateData.additionalImagesOrDocs) {
        if (!isValidUrl(url)) {
          return res
            .status(400)
            .json({ message: `Invalid URL in additionalImagesOrDocs: ${url}` });
        }
      }
    }

    // Validate intentScore if provided
    if (
      updateData.intentScore !== undefined &&
      typeof updateData.intentScore !== "number"
    ) {
      return res.status(400).json({ message: "intentScore must be a number" });
    }

    // Validate max_number_of_allowed_quotes if provided
    if (
      updateData.max_number_of_allowed_quotes !== undefined &&
      (typeof updateData.max_number_of_allowed_quotes !== "number" ||
        updateData.max_number_of_allowed_quotes < 0)
    ) {
      return res
        .status(400)
        .json({
          message: "max_number_of_allowed_quotes must be a non-negative number",
        });
    }

    // Perform the update with validation and return updated doc
    const updatedLead = await LeadManagement.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json(updatedLead);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: "Validation Error", errors: messages });
    }
    res
      .status(500)
      .json({ message: "Failed to update lead", error: error.message });
  }
};

// DELETE lead by ID
export const deleteLeadById = async (req, res) => {
  try {
    const deleted = await LeadManagement.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete lead", error: error.message });
  }
};


// Apis for Client Frontend to interact with

export const getActiveLeadDetails = async (req, res) => {
  try {
    const { LeadID } = req.params; // or req.params/query depending on your route setup

    if (!LeadID) {
      return res.status(400).json({ message: "LeadID is required" });
    }

    // Find active lead by LeadID
    const activeLead = await ActiveLeads.findOne({ LeadID }).exec();

    if (!activeLead) {
      return res.status(404).json({ message: "No active lead present" });
    }

    // Find the LeadManagement document by Lead_Doc_Id
    const leadManagementDoc = await LeadManagement.findById(
      activeLead.Lead_Doc_Id
    )
      .select(
        [
          "LeadID",
          "number_of_recieved_quotes",
          "max_number_of_allowed_quotes",
          "leadTitle",
          "Requirement",
          "referenceimages",
          "Quantity",
          "TargetCost",
          "TargetTAT",
        ].join(" ")
      )
      .exec();

    if (!leadManagementDoc) {
      return res.status(404).json({ message: "Lead management document not found" });
    }

    // Return requested fields
    return res.status(200).json(leadManagementDoc);
  } catch (error) {
    console.error("Error fetching active lead details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const testProcessLeadTransactions = async (req, res) => {
  try {
    console.log("🧪 Starting processLeadTransactions test...");
    
    await processLeadTransactions();
    
    console.log("✅ Test completed successfully!");
    res.json({ 
      message: "processLeadTransactions executed successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Test failed:", error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
};

export const checkVendorLeadEligibility = async (req, res) => {
  try {
    const { vendorEmail, leadId } = req.params; // From URL: /:vendorEmail/:leadId

    // 1. Validate inputs
    if (!vendorEmail || !leadId) {
      return res.status(400).json({ 
        message: "vendorEmail and leadId are required" 
      });
    }

    // 2. Check if vendor exists
    const vendor = await VendorDetails.findOne({ 
      VendorEmail: vendorEmail.toLowerCase().trim() 
    }).lean();

    if (!vendor) {
      return res.status(404).json({ 
        message: "Vendor not found",
        vendorEmail 
      });
    }

    // 3. Check if vendor already quoted this lead
    const hasExistingTransaction = vendor.transactionHistory.some(th => 
      th.LeadID === leadId
    );

    if (hasExistingTransaction) {
      return res.status(409).json({ 
        message: "Lead already quoted by this vendor",
        leadId,
        vendorEmail,
        eligible: false
      });
    }

    // 4. SUCCESS - Vendor can quote this lead
    res.status(200).json({
      message: "Vendor eligible to quote this lead",
      leadId,
      vendorEmail,
      vendorName: vendor.VendorName,
      vendorPhone: vendor.VendorPhone,
      eligible: true
    });

  } catch (error) {
    console.error("Error in checkVendorLeadEligibility:", error);
    res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};
