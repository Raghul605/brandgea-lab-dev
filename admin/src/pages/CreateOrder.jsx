import React, { useState } from "react";
import axios from "axios";

export default function CreateOrder() {
  const [formData, setFormData] = useState({
    clientEmail: "",
    clientName: "",
    clientPhone: "",
    serviceType: "",

    productName: "",
    garmentType: "",
    material: "",
    quantity: "",

    costPerPiece: "",
    totalLotValue: "",
    targetShipDate: "",
    expectedDeliveryDate: "",
    deliveryLocation: "",
    manufacturingCompany: "",
    manufacturingLocation: "",
    manufacturingContact: "",
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailChange = async (e) => {
    const email = e.target.value;
    setFormData((prev) => ({ ...prev, clientEmail: email }));

    if (email.includes("@")) {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/client-by-email?email=${email}`, { withCredentials: true }
        );
        setFormData((prev) => ({
          ...prev,
          clientName: data.name,
          clientPhone: data.phone,
        }));
      } catch {
        setFormData((prev) => ({ ...prev, clientName: "", clientPhone: "" }));
      }
    }
  };

  const handlePhoneChange = async (e) => {
    const phone = e.target.value;
    setFormData((prev) => ({ ...prev, clientPhone: phone }));

    if (phone.length >= 5) {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/client-by-phone?phone=${encodeURIComponent(phone)}`,
          { withCredentials: true }
        );
        setFormData((prev) => ({
          ...prev,
          clientName: data.name,
          clientEmail: data.email,
        }));
      } catch {
        setFormData((prev) => ({ ...prev, clientName: "", clientEmail: "" }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files).filter((f) => f.size > 0);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // const mandatoryFields = [
    //   "clientName",
    //   "clientEmail",
    //   "clientPhone",
    //   "serviceType",
    //   "product",
    //   "quantity",
    //   "deliveryLocation",
    //   "manufacturingCompany",
    //   "manufacturingLocation",
    //   "manufacturingContact",
    // ];

    // const emptyFields = mandatoryFields.filter((f) => !formData[f]?.trim());
    // if (emptyFields.length) {
    //   setError(`Please fill in: ${emptyFields.join(", ")}`);
    //   setLoading(false);
    //   return;
    // }

    const backendRequired = [
      "clientName",
      "clientEmail",
      "clientPhone",
      "serviceType",
      "productName",
      "garmentType",
      "material",
      "quantity",
      "costPerPiece",
      "totalLotValue",
      "deliveryLocation",
      "manufacturingCompany",
      "manufacturingLocation",
      "manufacturingContact",
    ];
    const empty = backendRequired.filter(
      (k) => !String(formData[k] || "").trim()
    );
    if (empty.length) {
      setError(`Please fill in: ${empty.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      // Object.entries(formData).forEach(([key, val]) => fd.append(key, val));

      fd.append("serviceType", formData.serviceType);
      fd.append("clientEmail", formData.clientEmail);
      fd.append("clientName", formData.clientName);
      fd.append("clientPhone", formData.clientPhone);
      if (formData.productName?.trim()) {
        fd.append("productName", formData.productName.trim());
      }

      // Mapped: "Product / Garment Type" -> garmentType
      fd.append("garmentType", formData.garmentType.trim());

      fd.append("material", formData.material.trim());
      // Mapped: quantity -> totalQuantity
      fd.append("totalQuantity", String(Number(formData.quantity || 0)));

      // pricing per piece
      if (formData.costPerPiece)
        fd.append("costPerPiece", String(Number(formData.costPerPiece)));
      // If totalLotValue empty but we have both numbers, auto-calc
      if (formData.totalLotValue) {
        fd.append("totalLotValue", String(Number(formData.totalLotValue)));
      }

      // ---- Logistics
      if (formData.deliveryLocation)
        fd.append("deliveryLocation", formData.deliveryLocation);
      if (formData.targetShipDate)
        fd.append("targetShipDate", formData.targetShipDate);
      if (formData.expectedDeliveryDate)
        fd.append("expectedDeliveryDate", formData.expectedDeliveryDate);

      // ---- Manufacturing
      fd.append("manufacturingCompany", formData.manufacturingCompany);
      fd.append("manufacturingLocation", formData.manufacturingLocation);
      fd.append("manufacturingContact", formData.manufacturingContact);

      files.forEach((file) => fd.append("files", file));

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );

      setFormData({
        clientEmail: "",
        clientName: "",
        clientPhone: "",
        serviceType: "",
        productName: "",
        garmentType: "",
        material: "",
        quantity: "",
        costPerPiece: "",
        totalLotValue: "",
        targetShipDate: "",
        expectedDeliveryDate: "",
        deliveryLocation: "",
        manufacturingCompany: "",
        manufacturingLocation: "",
        manufacturingContact: "",
      });
      setFiles([]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error creating order");
    } finally {
      setLoading(false);
    }
  };

  // const renderField = (
  //   label,
  //   name,
  //   type = "text",
  //   required = false,
  //   valueHandler = handleChange
  // ) => (
  //   <div className="flex items-center gap-4">
  //     <label className="w-48 font-semibold">
  //       {label}
  //       {required && <span className="text-red-500">*</span>}:
  //     </label>
  //     <input
  //       type={type}
  //       name={name}
  //       value={formData[name]}
  //       onChange={valueHandler}
  //       className="flex-1 border p-2 rounded"
  //     />
  //   </div>
  // );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded space-y-6">
      <h2 className="text-2xl font-bold mb-4">Create Order</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        encType="multipart/form-data"
      >
        <h3 className="font-semibold text-lg">Client Details</h3>
        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Client Email*</label>
          <input
            type="email"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleEmailChange}
            className="flex-1 border p-2 rounded"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Client Name*</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            className="flex-1 border p-2 rounded"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Client Phone*</label>
          <input
            type="text"
            name="clientPhone"
            value={formData.clientPhone}
            onChange={handlePhoneChange}
            className="flex-1 border p-2 rounded"
          />
        </div>

        <h3 className="font-semibold text-lg mt-4">Order Details</h3>
        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Service Type*</label>
          <input
            type="text"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="flex-1 border p-2 rounded"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Product Name</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            className="flex-1 border p-2 rounded"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Garment Type*</label>
          <input
            type="text"
            name="garmentType"
            value={formData.garmentType}
            onChange={handleChange}
            className="flex-1 border p-2 rounded"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Material*</label>
          <input
            type="text"
            name="material"
            value={formData.material}
            onChange={handleChange}
            className="flex-1 border p-2 rounded"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Quantity*</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="flex-1 border p-2 rounded"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Location*</label>
          <input
            type="text"
            name="deliveryLocation"
            value={formData.deliveryLocation}
            onChange={handleChange}
            placeholder="Delivery Location"
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Cost per piece*</label>
          <input
            type="number"
            name="costPerPiece"
            value={formData.costPerPiece}
            onChange={handleChange}
            className="flex-1 border p-2 rounded"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Total Lot Value*</label>
          <input
            type="number"
            name="totalLotValue"
            value={formData.totalLotValue}
            onChange={handleChange}
            className="flex-1 border p-2 rounded"
          />
        </div>

        <h3 className="font-semibold text-lg mt-4">Manufacturing Details</h3>
        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Company*</label>
          <input
            type="text"
            name="manufacturingCompany"
            value={formData.manufacturingCompany}
            onChange={handleChange}
            className="flex-1 border p-2 rounded"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Location*</label>
          <input
            type="text"
            name="manufacturingLocation"
            value={formData.manufacturingLocation}
            onChange={handleChange}
            className="flex-1 border p-2 rounded"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Contact*</label>
          <input
            type="text"
            name="manufacturingContact"
            value={formData.manufacturingContact}
            onChange={handleChange}
            className="flex-1 border p-2 rounded"
          />
        </div>

        <h3 className="font-semibold text-lg mt-4">Timeline</h3>
        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Target Ship Date*</label>
          <input
            type="date"
            name="targetShipDate"
            value={formData.targetShipDate}
            onChange={handleChange}
            className="flex-1 border p-2 rounded"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="w-56 font-semibold">Expected Delivery Date*</label>
          <input
            type="date"
            name="expectedDeliveryDate"
            value={formData.expectedDeliveryDate || ""} 
            onChange={handleChange}
            className="flex-1 border p-2 rounded"
          />
        </div>

        <h3 className="font-semibold text-lg mt-4">Attach Files</h3>
        <input type="file" multiple onChange={handleFilesChange} />
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {files.map((file, idx) => (
              <div key={idx} className="border p-1 text-sm">
                {file.name}
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4"
        >
          {loading ? "Creating..." : "Create Order"}
        </button>
      </form>
    </div>
  );
}

//   return (
//     <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded space-y-6">
//       <h2 className="text-2xl font-bold mb-4">Create Order</h2>
//       {error && <p className="text-red-500">{error}</p>}

//       <form
//         onSubmit={handleSubmit}
//         className="space-y-4"
//         encType="multipart/form-data"
//       >
//         <h3 className="font-semibold text-lg">Client Details</h3>
//         {renderField(
//           "Client Email",
//           "clientEmail",
//           "email",
//           true,
//           handleEmailChange
//         )}
//         {renderField("Client Name", "clientName", "text", true)}
//         {renderField(
//           "Client Phone",
//           "clientPhone",
//           "text",
//           true,
//           handlePhoneChange
//         )}

//         <h3 className="font-semibold text-lg mt-4">Order Details</h3>
//         {renderField("Service Type", "serviceType", "text", true)}
//         {renderField("Product", "product", "text", true)}
//         {renderField("Quantity", "quantity", "number", true)}
//         {renderField("Delivery Location", "deliveryLocation", "text", true)}

//         <h3 className="font-semibold text-lg mt-4">Manufacturing Details</h3>
//         {renderField(
//           "Manufacturing Company",
//           "manufacturingCompany",
//           "text",
//           true
//         )}
//         {renderField(
//           "Manufacturing Location",
//           "manufacturingLocation",
//           "text",
//           true
//         )}
//         {renderField(
//           "Manufacturing Contact",
//           "manufacturingContact",
//           "text",
//           true
//         )}

//         <h3 className="font-semibold text-lg mt-4">Dates (Optional)</h3>
//         {renderField("Target Ship Date", "targetShipDate", "date")}
//         {renderField("Expected Delivery Date", "expectedDeliveryDate", "date")}

//         <h3 className="font-semibold text-lg mt-4">Attach Files</h3>
//         <input type="file" multiple onChange={handleFilesChange} />
//         {files.length > 0 && (
//           <div className="flex flex-wrap gap-2 mt-2">
//             {files.map((file, idx) => (
//               <div key={idx} className="border p-1 text-sm">
//                 {file.name}
//               </div>
//             ))}
//           </div>
//         )}

//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4"
//         >
//           {loading ? "Creating..." : "Create Order"}
//         </button>
//       </form>
//     </div>
//   );
// }
