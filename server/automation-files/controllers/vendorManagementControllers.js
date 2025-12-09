import VendorDetails from "../../models/vendorDetailsModel.js";

export const createVendor = async (req, res) => {
  try {
    const { VendorEmail, VendorName, VendorPhone } = req.body;

    // Validate mandatory fields
    if (!VendorEmail || !VendorName || !VendorPhone) {
      return res.status(400).json({
        message: "Missing mandatory fields: VendorEmail, VendorName, and VendorPhone are required.",
      });
    }

    // Check for uniqueness of VendorEmail (case insensitive)
    const existingVendor = await VendorDetails.findOne({ VendorEmail: VendorEmail.toLowerCase() });
    if (existingVendor) {
      return res.status(409).json({ message: "VendorEmail already exists. Please use a different email." });
    }

    // Create new vendor
    const vendor = new VendorDetails(req.body);
    const savedVendor = await vendor.save();

    res.status(201).json(savedVendor);
  } catch (error) {
    // Dynamic error handling for validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: "Validation Error", errors: messages });
    }

    res.status(500).json({
      message: "Failed to create vendor",
      error: error.message,
    });
  }
};

// Get all Vendors (with optional filtering)
export const getAllVendors = async (req, res) => {
  try {
    const filter = {};

    // Add filter conditionally based on query params
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.VendorEmail) {
      filter.VendorEmail = req.query.VendorEmail.toLowerCase(); // case insensitive search with exact match
    }
    if (req.query.VendorPhone) {
      filter.VendorPhone = req.query.VendorPhone;
    }

    // Select only required fields
    const vendors = await VendorDetails.find(filter).select("_id VendorEmail VendorName VendorPhone status");

    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vendors", error: error.message });
  }
};


// Get Vendor by ID
export const getVendorById = async (req, res) => {
  try {
    const vendor = await VendorDetails.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vendor", error: error.message });
  }
};

// Update Vendor by ID (all allowed fields except transactionHistory)
export const updateVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if VendorEmail or VendorPhone is being updated
    if (updateData.VendorEmail) {
      const existingEmailVendor = await VendorDetails.findOne({
        VendorEmail: updateData.VendorEmail.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingEmailVendor) {
        return res.status(409).json({
          message: "VendorEmail already exists. Please use a different email.",
        });
      }
      // Normalize email to lowercase to match schema
      updateData.VendorEmail = updateData.VendorEmail.toLowerCase();
    }

    if (updateData.VendorPhone) {
      const existingPhoneVendor = await VendorDetails.findOne({
        VendorPhone: updateData.VendorPhone,
        _id: { $ne: id },
      });
      if (existingPhoneVendor) {
        return res.status(409).json({
          message: "VendorPhone already exists. Please use a different phone number.",
        });
      }
    }

    // Perform partial update
    const updatedVendor = await VendorDetails.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json(updatedVendor);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: "Validation error", errors: messages });
    }
    res.status(500).json({ message: "Failed to update vendor", error: error.message });
  }
};


// Delete Vendor by ID
export const deleteVendorById = async (req, res) => {
  try {
    const deletedVendor = await VendorDetails.findByIdAndDelete(req.params.id);
    if (!deletedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.status(200).json({ message: "Vendor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete vendor", error: error.message });
  }
};

// Change status only controller
export const changeVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = new Set(["active", "inactive", "pending"]);
    if (!allowed.has(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const vendor = await VendorDetails.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    );
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
