// // src/pages/admin/TempLeadDetails.jsx
// import { useEffect, useState, useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";

// const BASE = import.meta.env.VITE_BACKEND_URL;

// export default function TempLeadDetails() {
//   const { id } = useParams(); // TempLeadStore _id
//   const navigate = useNavigate();

//   const [lead, setLead] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [successMsg, setSuccessMsg] = useState("");

//   const [quantity, setQuantity] = useState("");
//   const [targetCost, setTargetCost] = useState("");
//   const [targetTAT, setTargetTAT] = useState(""); // date (YYYY-MM-DD)
//   const [deliveryCity, setDeliveryCity] = useState("");

//   const [sizeRows, setSizeRows] = useState([
//     { size: "S", qty: "" },
//     { size: "M", qty: "" },
//     { size: "L", qty: "" },
//   ]);

//   useEffect(() => {
//     const fetchLead = async () => {
//       try {
//         setError("");
//         setLoading(true);
//         const res = await axios.get(
//           `${BASE}/api/automation/temp-lead/leads/${id}`
//         );
//         const fullLead = res.data?.data;
//         setLead(fullLead);

//         if (fullLead) {
//           if (fullLead.Quantity !== undefined && fullLead.Quantity !== null) {
//             setQuantity(fullLead.Quantity);
//           }
//           if (fullLead.TargetCost !== undefined && fullLead.TargetCost !== null) {
//             setTargetCost(fullLead.TargetCost);
//           }

//           // TempLeadStore currently saves TargetTAT as Number(...) – treat as not-date by default
//           // Admin will set a proper date
//           // If in future you store ISO dates, you can parse here.

//           if (fullLead.DeliveryCity) {
//             setDeliveryCity(fullLead.DeliveryCity);
//           }
//         }
//       } catch (err) {
//         console.error("Error fetching temp lead:", err);
//         const msg =
//           err?.response?.data?.error ||
//           err?.response?.data?.message ||
//           "Failed to load temp lead details.";
//         setError(msg);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       fetchLead();
//     } else {
//       setLoading(false);
//       setError("Missing temp lead id in URL.");
//     }
//   }, [id]);

//   const requirementSummary = () => {
//     if (!lead?.Requirement) return "No requirement data.";
//     const req = lead.Requirement;

//     if (typeof req === "string") return req;

//     if (typeof req === "object") {
//       const lines = [];

//       const walk = (obj, prefix = "") => {
//         Object.entries(obj).forEach(([key, value]) => {
//           const label =
//             key.charAt(0).toUpperCase() +
//             key
//               .slice(1)
//               .replace(/_/g, " ")
//               .replace(/([A-Z])/g, " $1")
//               .trim();

//           if (value === null || value === undefined || value === "") return;

//           if (Array.isArray(value)) {
//             if (!value.length) return;
//             lines.push(`${prefix}${label}: ${value.join(", ")}`);
//           } else if (typeof value === "object") {
//             walk(value, `${label} → `);
//           } else {
//             lines.push(`${prefix}${label}: ${value}`);
//           }
//         });
//       };

//       walk(req);
//       if (!lines.length) return JSON.stringify(req, null, 2);
//       return lines.join("\n");
//     }

//     return String(req);
//   };

//   const totalQtyNumber = useMemo(
//     () => Number(quantity) || 0,
//     [quantity]
//   );

//   const allocatedQty = useMemo(
//     () =>
//       sizeRows.reduce(
//         (sum, row) => sum + (Number(row.qty) || 0),
//         0
//       ),
//     [sizeRows]
//   );

//   const remainingQty = totalQtyNumber - allocatedQty;
//   const overAllocated = remainingQty < 0;

//   const handleSizeRowChange = (index, key, value) => {
//     setSizeRows((prev) =>
//       prev.map((row, idx) =>
//         idx === index ? { ...row, [key]: value } : row
//       )
//     );
//   };

//   const handleAddSizeRow = () => {
//     setSizeRows((prev) => [...prev, { size: "", qty: "" }]);
//   };

//   const handleRemoveSizeRow = (index) => {
//     setSizeRows((prev) => prev.filter((_, idx) => idx !== index));
//   };

//   const handleConfirmToPermanentLead = async () => {
//     if (!lead) return;

//     setSaving(true);
//     setError("");
//     setSuccessMsg("");

//     if (!totalQtyNumber || totalQtyNumber <= 0) {
//       setError("Please enter a valid total quantity.");
//       setSaving(false);
//       return;
//     }

//     if (overAllocated) {
//       setError(
//         "Size ratio allocation exceeds total quantity. Please adjust the table."
//       );
//       setSaving(false);
//       return;
//     }

//     try {
//       const sizeRatioClean = sizeRows
//         .filter((r) => r.size && Number(r.qty) > 0)
//         .map((r) => ({
//           size: r.size.trim(),
//           qty: Number(r.qty),
//         }));

//       const sizeRatioNote = sizeRatioClean
//         .map((r) => `${r.size} - ${r.qty}`)
//         .join(", ");

//       const body = {
//         CustomerName: lead.CustomerName,
//         CustomerMobile: lead.CustomerMobile,
//         CustomerEmail: lead.CustomerEmail,
//         leadTitle: lead.leadTitle,
//         Requirement: lead.Requirement,
//         referenceimages: lead.referenceimages || [],
//         Quantity: totalQtyNumber,
//         TargetCost: Number(targetCost) || 0,
//         TargetTAT: targetTAT || "",
//         additionalImagesOrDocs: lead.additionalImagesOrDocs || [],
//         intentScore: lead.intentScore,
//         max_number_of_allowed_quotes:
//           lead.max_number_of_allowed_quotes || 5,
//         userId: lead.userId,
//         chatId: lead.chatId,
//         TempLeadStoreid: lead._id,
//         DeliveryCity: deliveryCity || "",
//         SizeRatioNote: sizeRatioNote,
//         SizeRatioTable: sizeRatioClean,
//       };

//       const res = await axios.post(
//         `${BASE}/api/automation/lead-management/leads`,
//         body
//       );

//       const newLead = res.data;

//       setSuccessMsg("Permanent lead created successfully.");
//       setTimeout(() => setSuccessMsg(""), 2500);

//       // Navigate to final lead details
//       if (newLead && newLead._id) {
//         navigate(`/dashboard/leads/${newLead._id}`);
//       } else {
//         navigate("/dashboard/leads");
//       }
//     } catch (err) {
//       console.error("Error creating permanent lead:", err);
//       const msg =
//         err?.response?.data?.message ||
//         err?.response?.data?.error ||
//         "Failed to create permanent lead.";
//       setError(msg);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-4 min-h-[80vh] flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
//       </div>
//     );
//   }

//   if (!lead) {
//     return (
//       <div className="p-4 min-h-[80vh] flex flex-col items-center justify-center">
//         <p className="text-sm text-gray-600 mb-3">
//           Temp lead not found or deleted.
//         </p>
//         <button
//           onClick={() => navigate("/dashboard/temp-leads")}
//           className="px-4 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-900"
//         >
//           Back to temp leads
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 sm:p-6" style={{ minHeight: "80vh" }}>
//       <div className="max-w-4xl mx-auto space-y-4">
//         <button
//           className="text-xs text-gray-600 hover:text-black mb-1"
//           onClick={() => navigate("/dashboard/temp-leads")}
//         >
//           ← Back to temp leads
//         </button>

//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//           <div>
//             <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
//               Temp Lead – Review & Confirm
//             </h1>
//             <p className="text-xs text-gray-500 mt-1">
//               Once confirmed, this becomes an active lead visible in the Leads
//               section.
//             </p>
//           </div>

//           <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
//             <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
//             Waiting Confirmation
//           </span>
//         </div>

//         {error && (
//           <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
//             {error}
//           </div>
//         )}
//         {successMsg && (
//           <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
//             {successMsg}
//           </div>
//         )}

//         {/* Customer + Requirement */}
//         <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-3">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//             <div>
//               <div className="text-[11px] uppercase text-gray-500">
//                 Customer
//               </div>
//               <div className="text-sm text-gray-900 font-medium">
//                 {lead.CustomerName} • {lead.CustomerEmail}
//               </div>
//               <div className="text-xs text-gray-600">
//                 {lead.CustomerMobile}
//               </div>
//             </div>
//             <div className="text-[11px] text-gray-500">
//               Temp ID:{" "}
//               <span className="font-mono text-gray-800">{lead._id}</span>
//             </div>
//           </div>

//           <div>
//             <div className="text-[11px] uppercase text-gray-500">
//               Lead Title
//             </div>
//             <div className="text-sm text-gray-900 font-semibold">
//               {lead.leadTitle}
//             </div>
//           </div>

//           <div>
//             <div className="text-[11px] uppercase text-gray-500 mb-1">
//               Requirement (Readable)
//             </div>
//             <pre className="text-xs text-gray-800 whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
//               {requirementSummary()}
//             </pre>
//           </div>

//           {lead.referenceimages?.length > 0 && (
//             <div>
//               <div className="text-[11px] uppercase text-gray-500 mb-1">
//                 Reference images
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {lead.referenceimages.map((url, idx) => (
//                   <a
//                     key={idx}
//                     href={url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="inline-flex items-center justify-center w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden hover:border-gray-400"
//                   >
//                     <img
//                       src={url}
//                       alt={`ref-${idx}`}
//                       className="w-full h-full object-cover"
//                     />
//                   </a>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Admin Inputs (Total qty, ratio table, city, TAT, cost) */}
//         <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-4">
//           <div className="flex items-center justify-between mb-1">
//             <div className="text-sm font-semibold text-gray-900">
//               Admin Inputs – Order Structuring
//             </div>
//             <div className="text-[11px] text-gray-500">
//               Ensure ratio sums within total quantity
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
//             <div>
//               <label className="block text-[11px] text-gray-600 mb-1">
//                 Total Quantity (pcs)
//               </label>
//               <input
//                 type="number"
//                 value={quantity}
//                 onChange={(e) => setQuantity(e.target.value)}
//                 className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
//                 placeholder="e.g. 200"
//               />
//             </div>
//             <div>
//               <label className="block text-[11px] text-gray-600 mb-1">
//                 Target Cost (₹)
//               </label>
//               <input
//                 type="number"
//                 value={targetCost}
//                 onChange={(e) => setTargetCost(e.target.value)}
//                 className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
//                 placeholder="Total or per unit"
//               />
//             </div>
//             <div>
//               <label className="block text-[11px] text-gray-600 mb-1">
//                 Target TAT (Delivery Date)
//               </label>
//               <input
//                 type="date"
//                 value={targetTAT}
//                 onChange={(e) => setTargetTAT(e.target.value)}
//                 className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
//               />
//             </div>
//             <div>
//               <label className="block text-[11px] text-gray-600 mb-1">
//                 Delivery City
//               </label>
//               <input
//                 type="text"
//                 value={deliveryCity}
//                 onChange={(e) => setDeliveryCity(e.target.value)}
//                 className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
//                 placeholder="e.g. Tirupur"
//               />
//             </div>
//           </div>

//           {/* Size ratio table */}
//           <div className="mt-3">
//             <div className="flex items-center justify-between mb-2">
//               <div className="text-[11px] uppercase text-gray-500">
//                 Size Ratio Table
//               </div>
//               <div className="text-[11px] text-gray-600">
//                 Allocated:{" "}
//                 <span className={overAllocated ? "text-red-600" : "text-gray-900"}>
//                   {allocatedQty}
//                 </span>{" "}
//                 / {totalQtyNumber || 0} pcs{" "}
//                 {totalQtyNumber > 0 && !overAllocated && (
//                   <span className="ml-1 text-gray-500">
//                     (Remaining {remainingQty} pcs)
//                   </span>
//                 )}
//                 {overAllocated && (
//                   <span className="ml-1 text-red-600 font-semibold">
//                     Over by {Math.abs(remainingQty)} pcs
//                   </span>
//                 )}
//               </div>
//             </div>

//             <div className="rounded-lg border border-gray-200 overflow-hidden">
//               <table className="w-full text-xs">
//                 <thead className="bg-gray-50">
//                   <tr className="text-left text-[10px] uppercase tracking-wide text-gray-500">
//                     <th className="px-2 py-1.5 w-32">Size</th>
//                     <th className="px-2 py-1.5 w-32">Qty</th>
//                     <th className="px-2 py-1.5 w-10 text-center">Remove</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-100">
//                   {sizeRows.map((row, idx) => (
//                     <tr key={idx}>
//                       <td className="px-2 py-1.5">
//                         <input
//                           type="text"
//                           value={row.size}
//                           onChange={(e) =>
//                             handleSizeRowChange(idx, "size", e.target.value)
//                           }
//                           className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-black"
//                           placeholder="S / M / L / XL"
//                         />
//                       </td>
//                       <td className="px-2 py-1.5">
//                         <input
//                           type="number"
//                           value={row.qty}
//                           onChange={(e) =>
//                             handleSizeRowChange(idx, "qty", e.target.value)
//                           }
//                           className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-black"
//                           placeholder="e.g. 40"
//                         />
//                       </td>
//                       <td className="px-2 py-1.5 text-center">
//                         {sizeRows.length > 1 && (
//                           <button
//                             type="button"
//                             onClick={() => handleRemoveSizeRow(idx)}
//                             className="inline-flex items-center justify-center text-gray-400 hover:text-red-500 text-lg leading-none"
//                           >
//                             ×
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <button
//               type="button"
//               onClick={handleAddSizeRow}
//               className="mt-2 inline-flex items-center rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-[11px] text-gray-700 hover:bg-gray-50"
//             >
//               + Add size row
//             </button>
//           </div>

//           <button
//             type="button"
//             onClick={handleConfirmToPermanentLead}
//             disabled={saving}
//             className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60"
//           >
//             {saving ? "Converting..." : "Confirm & Create Permanent Lead"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



// // src/pages/admin/TempLeadDetails.jsx
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";

// const BASE = import.meta.env.VITE_BACKEND_URL;

// export default function TempLeadDetails() {
//   const { id } = useParams(); // TempLeadStore _id
//   const navigate = useNavigate();

//   const [lead, setLead] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [successMsg, setSuccessMsg] = useState("");

//   // Admin inputs (only what we actually need for backend now)
//   const [quantity, setQuantity] = useState("");
//   const [targetCost, setTargetCost] = useState("");
//   const [targetTAT, setTargetTAT] = useState(""); // date (YYYY-MM-DD)

//   useEffect(() => {
//     const fetchLead = async () => {
//       try {
//         setError("");
//         setLoading(true);
//         const res = await axios.get(
//           `${BASE}/api/automation/temp-lead/leads/${id}`
//         );
//         const fullLead = res.data?.data;
//         setLead(fullLead);

//         if (fullLead) {
//           if (fullLead.Quantity !== undefined && fullLead.Quantity !== null) {
//             setQuantity(fullLead.Quantity);
//           }
//           if (
//             fullLead.TargetCost !== undefined &&
//             fullLead.TargetCost !== null
//           ) {
//             setTargetCost(fullLead.TargetCost);
//           }
//           // TempLeadStore currently stores TargetTAT as Number(TargetTAT)
//           // We let admin choose a proper date for final lead, so we don't pre-fill here.
//         }
//       } catch (err) {
//         console.error("Error fetching temp lead:", err);
//         const msg =
//           err?.response?.data?.error ||
//           err?.response?.data?.message ||
//           "Failed to load temp lead details.";
//         setError(msg);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       fetchLead();
//     } else {
//       setLoading(false);
//       setError("Missing temp lead id in URL.");
//     }
//   }, [id]);

//   const requirementSummary = () => {
//     if (!lead?.Requirement) return "No requirement data.";
//     const req = lead.Requirement;

//     if (typeof req === "string") return req;

//     if (typeof req === "object") {
//       const lines = [];

//       const walk = (obj, prefix = "") => {
//         Object.entries(obj).forEach(([key, value]) => {
//           const label =
//             key.charAt(0).toUpperCase() +
//             key
//               .slice(1)
//               .replace(/_/g, " ")
//               .replace(/([A-Z])/g, " $1")
//               .trim();

//           if (value === null || value === undefined || value === "") return;

//           if (Array.isArray(value)) {
//             if (!value.length) return;
//             lines.push(`${prefix}${label}: ${value.join(", ")}`);
//           } else if (typeof value === "object") {
//             walk(value, `${label} → `);
//           } else {
//             lines.push(`${prefix}${label}: ${value}`);
//           }
//         });
//       };

//       walk(req);
//       if (!lines.length) return JSON.stringify(req, null, 2);
//       return lines.join("\n");
//     }

//     return String(req);
//   };

//   const handleConfirmToPermanentLead = async () => {
//     if (!lead) return;

//     setSaving(true);
//     setError("");
//     setSuccessMsg("");

//     const qtyNumber = Number(quantity) || 0;

//     if (!qtyNumber || qtyNumber <= 0) {
//       setError("Please enter a valid total quantity.");
//       setSaving(false);
//       return;
//     }

//     try {
//       const body = {
//         CustomerName: lead.CustomerName,
//         CustomerMobile: lead.CustomerMobile,
//         CustomerEmail: lead.CustomerEmail,
//         leadTitle: lead.leadTitle,
//         Requirement: lead.Requirement,
//         referenceimages: lead.referenceimages || [],
//         Quantity: qtyNumber,
//         TargetCost: Number(targetCost) || 0,
//         TargetTAT: targetTAT || "",
//         additionalImagesOrDocs: lead.additionalImagesOrDocs || [],
//         intentScore: lead.intentScore,
//         max_number_of_allowed_quotes:
//           lead.max_number_of_allowed_quotes || 5,
//         userId: lead.userId,
//         chatId: lead.chatId,
//         TempLeadStoreid: lead._id, // so backend can delete temp lead
//         // 👇 removed DeliveryCity, SizeRatioNote, SizeRatioTable
//       };

//       const res = await axios.post(
//         `${BASE}/api/automation/lead-management/leads`,
//         body
//       );

//       const newLead = res.data;

//       setSuccessMsg("Permanent lead created successfully.");
//       setTimeout(() => setSuccessMsg(""), 2500);

//       // Navigate to final lead details
//       if (newLead && newLead._id) {
//         navigate(`/dashboard/leads/${newLead._id}`);
//       } else {
//         navigate("/dashboard/leads");
//       }
//     } catch (err) {
//       console.error("Error creating permanent lead:", err);
//       const msg =
//         err?.response?.data?.message ||
//         err?.response?.data?.error ||
//         "Failed to create permanent lead.";
//       setError(msg);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-4 min-h-[80vh] flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
//       </div>
//     );
//   }

//   if (!lead) {
//     return (
//       <div className="p-4 min-h-[80vh] flex flex-col items-center justify-center">
//         <p className="text-sm text-gray-600 mb-3">
//           Temp lead not found or deleted.
//         </p>
//         <button
//           onClick={() => navigate("/dashboard/temp-leads")}
//           className="px-4 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-900"
//         >
//           Back to temp leads
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 sm:p-6" style={{ minHeight: "80vh" }}>
//       <div className="max-w-4xl mx-auto space-y-4">
//         <button
//           className="text-xs text-gray-600 hover:text-black mb-1"
//           onClick={() => navigate("/dashboard/temp-leads")}
//         >
//           ← Back to temp leads
//         </button>

//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//           <div>
//             <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
//               Temp Lead – Review & Confirm
//             </h1>
//             <p className="text-xs text-gray-500 mt-1">
//               Once confirmed, this becomes an active lead visible in the Leads
//               section.
//             </p>
//           </div>

//           <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
//             <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
//             Waiting Confirmation
//           </span>
//         </div>

//         {error && (
//           <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
//             {error}
//           </div>
//         )}
//         {successMsg && (
//           <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
//             {successMsg}
//           </div>
//         )}

//         {/* Customer + Requirement */}
//         <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-3">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//             <div>
//               <div className="text-[11px] uppercase text-gray-500">
//                 Customer
//               </div>
//               <div className="text-sm text-gray-900 font-medium">
//                 {lead.CustomerName} • {lead.CustomerEmail}
//               </div>
//               <div className="text-xs text-gray-600">
//                 {lead.CustomerMobile}
//               </div>
//             </div>
//             <div className="text-[11px] text-gray-500">
//               Temp ID:{" "}
//               <span className="font-mono text-gray-800">{lead._id}</span>
//             </div>
//           </div>

//           <div>
//             <div className="text-[11px] uppercase text-gray-500">
//               Lead Title
//             </div>
//             <div className="text-sm text-gray-900 font-semibold">
//               {lead.leadTitle}
//             </div>
//           </div>

//           <div>
//             <div className="text-[11px] uppercase text-gray-500 mb-1">
//               Requirement (Readable)
//             </div>
//             <pre className="text-xs text-gray-800 whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
//               {requirementSummary()}
//             </pre>
//           </div>

//           {lead.referenceimages?.length > 0 && (
//             <div>
//               <div className="text-[11px] uppercase text-gray-500 mb-1">
//                 Reference images
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {lead.referenceimages.map((url, idx) => (
//                   <a
//                     key={idx}
//                     href={url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="inline-flex items-center justify-center w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden hover:border-gray-400"
//                   >
//                     <img
//                       src={url}
//                       alt={`ref-${idx}`}
//                       className="w-full h-full object-cover"
//                     />
//                   </a>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Admin Inputs – only core fields now */}
//         <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-4">
//           <div className="flex items-center justify-between mb-1">
//             <div className="text-sm font-semibold text-gray-900">
//               Admin Inputs – Order Summary
//             </div>
//             <div className="text-[11px] text-gray-500">
//               Fill only what is required for the permanent lead.
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//             <div>
//               <label className="block text-[11px] text-gray-600 mb-1">
//                 Total Quantity (pcs)
//               </label>
//               <input
//                 type="number"
//                 value={quantity}
//                 onChange={(e) => setQuantity(e.target.value)}
//                 className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
//                 placeholder="e.g. 200"
//               />
//             </div>
//             <div>
//               <label className="block text-[11px] text-gray-600 mb-1">
//                 Target Cost (₹)
//               </label>
//               <input
//                 type="number"
//                 value={targetCost}
//                 onChange={(e) => setTargetCost(e.target.value)}
//                 className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
//                 placeholder="Total or per unit"
//               />
//             </div>
//             <div>
//               <label className="block text-[11px] text-gray-600 mb-1">
//                 Target TAT (Delivery Date)
//               </label>
//               <input
//                 type="date"
//                 value={targetTAT}
//                 onChange={(e) => setTargetTAT(e.target.value)}
//                 className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
//               />
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={handleConfirmToPermanentLead}
//             disabled={saving}
//             className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60"
//           >
//             {saving ? "Converting..." : "Confirm & Create Permanent Lead"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



// // src/pages/admin/TempLeadDetails.jsx
// import { useEffect, useState, useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";

// const BASE = import.meta.env.VITE_BACKEND_URL;

// export default function TempLeadDetails() {
//   const { id } = useParams(); // TempLeadStore _id
//   const navigate = useNavigate();

//   const [lead, setLead] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [successMsg, setSuccessMsg] = useState("");

//   const [quantity, setQuantity] = useState("");
//   const [targetCost, setTargetCost] = useState("");
//   const [targetTAT, setTargetTAT] = useState(""); // date (YYYY-MM-DD)
//   const [deliveryCity, setDeliveryCity] = useState("");

//   // Single extra info field
//   const [extraInfo, setExtraInfo] = useState("");

//   const [sizeRows, setSizeRows] = useState([
//     { size: "S", qty: "" },
//     { size: "M", qty: "" },
//     { size: "L", qty: "" },
//   ]);

//   useEffect(() => {
//     const fetchLead = async () => {
//       try {
//         setError("");
//         setLoading(true);
//         const res = await axios.get(
//           `${BASE}/api/automation/temp-lead/leads/${id}`
//         );
//         const fullLead = res.data?.data;
//         setLead(fullLead);

//         if (fullLead) {
//           if (fullLead.Quantity !== undefined && fullLead.Quantity !== null) {
//             setQuantity(fullLead.Quantity);
//           }
//           if (
//             fullLead.TargetCost !== undefined &&
//             fullLead.TargetCost !== null
//           ) {
//             setTargetCost(fullLead.TargetCost);
//           }

//           const reqObj =
//             typeof fullLead.Requirement === "object" && fullLead.Requirement
//               ? fullLead.Requirement
//               : {};

//           if (reqObj.deliveryCity) {
//             setDeliveryCity(reqObj.deliveryCity);
//           }

//           if (reqObj.additionalInfo) {
//             setExtraInfo(reqObj.additionalInfo);
//           }

//           // If you later save sizeRatioTable on temp leads, you can pre-fill sizeRows here.
//         }
//       } catch (err) {
//         console.error("Error fetching temp lead:", err);
//         const msg =
//           err?.response?.data?.error ||
//           err?.response?.data?.message ||
//           "Failed to load temp lead details.";
//         setError(msg);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       fetchLead();
//     } else {
//       setLoading(false);
//       setError("Missing temp lead id in URL.");
//     }
//   }, [id]);

//   const requirementSummary = () => {
//     if (!lead?.Requirement) return "No requirement data.";
//     const req = lead.Requirement;

//     if (typeof req === "string") return req;

//     if (typeof req === "object") {
//       const lines = [];

//       const walk = (obj, prefix = "") => {
//         Object.entries(obj).forEach(([key, value]) => {
//           const label =
//             key.charAt(0).toUpperCase() +
//             key
//               .slice(1)
//               .replace(/_/g, " ")
//               .replace(/([A-Z])/g, " $1")
//               .trim();

//           if (value === null || value === undefined || value === "") return;

//           // Skip internal/meta keys so summary stays clean
//           if (["deliveryCity", "sizeRatioTable", "additionalInfo"].includes(key)) {
//             return;
//           }

//           if (Array.isArray(value)) {
//             if (!value.length) return;
//             lines.push(`${prefix}${label}: ${value.join(", ")}`);
//           } else if (typeof value === "object") {
//             walk(value, `${label} → `);
//           } else {
//             lines.push(`${prefix}${label}: ${value}`);
//           }
//         });
//       };

//       walk(req);
//       if (!lines.length) return JSON.stringify(req, null, 2);
//       return lines.join("\n");
//     }

//     return String(req);
//   };

//   const totalQtyNumber = useMemo(() => Number(quantity) || 0, [quantity]);

//   const allocatedQty = useMemo(
//     () =>
//       sizeRows.reduce((sum, row) => sum + (Number(row.qty) || 0), 0),
//     [sizeRows]
//   );

//   const remainingQty = totalQtyNumber - allocatedQty;
//   const overAllocated = remainingQty < 0;

//   const handleSizeRowChange = (index, key, value) => {
//     setSizeRows((prev) =>
//       prev.map((row, idx) =>
//         idx === index ? { ...row, [key]: value } : row
//       )
//     );
//   };

//   const handleAddSizeRow = () => {
//     setSizeRows((prev) => [...prev, { size: "", qty: "" }]);
//   };

//   const handleRemoveSizeRow = (index) => {
//     setSizeRows((prev) => prev.filter((_, idx) => idx !== index));
//   };

//   const handleConfirmToPermanentLead = async () => {
//     if (!lead) return;

//     setSaving(true);
//     setError("");
//     setSuccessMsg("");

//     if (!totalQtyNumber || totalQtyNumber <= 0) {
//       setError("Please enter a valid total quantity.");
//       setSaving(false);
//       return;
//     }

//     if (!targetTAT) {
//       setError("Please select the target delivery date (TAT).");
//       setSaving(false);
//       return;
//     }

//     if (overAllocated) {
//       setError(
//         "Size ratio allocation exceeds total quantity. Please adjust the table."
//       );
//       setSaving(false);
//       return;
//     }

//     try {
//       const sizeRatioClean = sizeRows
//         .filter((r) => r.size && Number(r.qty) > 0)
//         .map((r) => ({
//           size: r.size.trim(),
//           qty: Number(r.qty),
//         }));

//       // Base Requirement
//       const baseReq =
//         typeof lead.Requirement === "object" && lead.Requirement
//           ? { ...lead.Requirement }
//           : lead.Requirement || {};

//       const enhancedRequirement = { ...baseReq };

//       if (deliveryCity) {
//         enhancedRequirement.deliveryCity = deliveryCity;
//       }
//       if (sizeRatioClean.length > 0) {
//         enhancedRequirement.sizeRatioTable = sizeRatioClean; // 👈 only this, no note
//       }
//       if (extraInfo) {
//         enhancedRequirement.additionalInfo = extraInfo;
//       }

//       const body = {
//         CustomerName: lead.CustomerName,
//         CustomerMobile: lead.CustomerMobile,
//         CustomerEmail: lead.CustomerEmail,
//         leadTitle: lead.leadTitle,
//         Requirement: enhancedRequirement,
//         referenceimages: lead.referenceimages || [],
//         Quantity: totalQtyNumber,
//         TargetCost: Number(targetCost) || 0,
//         TargetTAT: targetTAT,
//         additionalImagesOrDocs: lead.additionalImagesOrDocs || [],
//         intentScore: lead.intentScore,
//         max_number_of_allowed_quotes:
//           lead.max_number_of_allowed_quotes || 5,
//         userId: lead.userId,
//         chatId: lead.chatId,
//         TempLeadStoreid: lead._id,
//       };

//       const res = await axios.post(
//         `${BASE}/api/automation/lead-management/leads`,
//         body
//       );

//       const newLead = res.data;

//       setSuccessMsg("Permanent lead created successfully.");
//       setTimeout(() => setSuccessMsg(""), 2500);

//       if (newLead && newLead._id) {
//         navigate(`/dashboard/leads/${newLead._id}`);
//       } else {
//         navigate("/dashboard/leads");
//       }
//     } catch (err) {
//       console.error("Error creating permanent lead:", err);
//       const msg =
//         err?.response?.data?.message ||
//         err?.response?.data?.error ||
//         "Failed to create permanent lead.";
//       setError(msg);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-4 min-h-[80vh] flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
//       </div>
//     );
//   }

//   if (!lead) {
//     return (
//       <div className="p-4 min-h-[80vh] flex flex-col items-center justify-center">
//         <p className="text-sm text-gray-600 mb-3">
//           Temp lead not found or deleted.
//         </p>
//         <button
//           onClick={() => navigate("/dashboard/temp-leads")}
//           className="px-4 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-900"
//         >
//           Back to temp leads
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 sm:p-6" style={{ minHeight: "80vh" }}>
//       <div className="max-w-4xl mx-auto space-y-4">
//         <button
//           className="text-xs text-gray-600 hover:text-black mb-1"
//           onClick={() => navigate("/dashboard/temp-leads")}
//         >
//           ← Back to temp leads
//         </button>

//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//           <div>
//             <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
//               Temp Lead – Review & Confirm
//             </h1>
//             <p className="text-xs text-gray-500 mt-1">
//               Once confirmed, this becomes an active lead visible in the Leads
//               section.
//             </p>
//           </div>

//           <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
//             <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
//             Waiting Confirmation
//           </span>
//         </div>

//         {error && (
//           <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
//             {error}
//           </div>
//         )}
//         {successMsg && (
//           <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
//             {successMsg}
//           </div>
//         )}

//         {/* Customer + Requirement */}
//         <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-3">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//             <div>
//               <div className="text-[11px] uppercase text-gray-500">
//                 Customer
//               </div>
//               <div className="text-sm text-gray-900 font-medium">
//                 {lead.CustomerName} • {lead.CustomerEmail}
//               </div>
//               <div className="text-xs text-gray-600">
//                 {lead.CustomerMobile}
//               </div>
//             </div>
//             <div className="text-[11px] text-gray-500">
//               Temp ID:{" "}
//               <span className="font-mono text-gray-800">{lead._id}</span>
//             </div>
//           </div>

//           <div>
//             <div className="text-[11px] uppercase text-gray-500">
//               Lead Title
//             </div>
//             <div className="text-sm text-gray-900 font-semibold">
//               {lead.leadTitle}
//             </div>
//           </div>

//           <div>
//             <div className="text-[11px] uppercase text-gray-500 mb-1">
//               Requirement (Readable)
//             </div>
//             <pre className="text-xs text-gray-800 whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
//               {requirementSummary()}
//             </pre>
//           </div>

//           {lead.referenceimages?.length > 0 && (
//             <div>
//               <div className="text-[11px] uppercase text-gray-500 mb-1">
//                 Reference images
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {lead.referenceimages.map((url, idx) => (
//                   <a
//                     key={idx}
//                     href={url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="inline-flex items-center justify-center w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden hover:border-gray-400"
//                   >
//                     <img
//                       src={url}
//                       alt={`ref-${idx}`}
//                       className="w-full h-full object-cover"
//                     />
//                   </a>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Admin Inputs */}
//         <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-4">
//           <div className="flex items-center justify-between mb-1">
//             <div className="text-sm font-semibold text-gray-900">
//               Admin Inputs – Order Structuring
//             </div>
//             <div className="text-[11px] text-gray-500">
//               Ensure ratio sums within total quantity
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
//             <div>
//               <label className="block text-[11px] text-gray-600 mb-1">
//                 Total Quantity (pcs)
//               </label>
//               <input
//                 type="number"
//                 value={quantity}
//                 onChange={(e) => setQuantity(e.target.value)}
//                 className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
//                 placeholder="e.g. 200"
//               />
//             </div>
//             <div>
//               <label className="block text-[11px] text-gray-600 mb-1">
//                 Target Cost (₹)
//               </label>
//               <input
//                 type="number"
//                 value={targetCost}
//                 onChange={(e) => setTargetCost(e.target.value)}
//                 className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
//                 placeholder="Total or per unit"
//               />
//             </div>
//             <div>
//               <label className="block text-[11px] text-gray-600 mb-1">
//                 Target TAT (Delivery Date)
//               </label>
//               <input
//                 type="date"
//                 value={targetTAT}
//                 onChange={(e) => setTargetTAT(e.target.value)}
//                 className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
//               />
//             </div>
//             <div>
//               <label className="block text-[11px] text-gray-600 mb-1">
//                 Delivery City
//               </label>
//               <input
//                 type="text"
//                 value={deliveryCity}
//                 onChange={(e) => setDeliveryCity(e.target.value)}
//                 className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
//                 placeholder="e.g. Tirupur"
//               />
//             </div>
//           </div>

//           {/* Size ratio table */}
//           <div className="mt-3">
//             <div className="flex items-center justify-between mb-2">
//               <div className="text-[11px] uppercase text-gray-500">
//                 Size Ratio Table
//               </div>
//               <div className="text-[11px] text-gray-600">
//                 Allocated:{" "}
//                 <span
//                   className={overAllocated ? "text-red-600" : "text-gray-900"}
//                 >
//                   {allocatedQty}
//                 </span>{" "}
//                 / {totalQtyNumber || 0} pcs{" "}
//                 {totalQtyNumber > 0 && !overAllocated && (
//                   <span className="ml-1 text-gray-500">
//                     (Remaining {remainingQty} pcs)
//                   </span>
//                 )}
//                 {overAllocated && (
//                   <span className="ml-1 text-red-600 font-semibold">
//                     Over by {Math.abs(remainingQty)} pcs
//                   </span>
//                 )}
//               </div>
//             </div>

//             <div className="rounded-lg border border-gray-200 overflow-hidden">
//               <table className="w-full text-xs">
//                 <thead className="bg-gray-50">
//                   <tr className="text-left text-[10px] uppercase tracking-wide text-gray-500">
//                     <th className="px-2 py-1.5 w-32">Size</th>
//                     <th className="px-2 py-1.5 w-32">Qty</th>
//                     <th className="px-2 py-1.5 w-10 text-center">Remove</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-100">
//                   {sizeRows.map((row, idx) => (
//                     <tr key={idx}>
//                       <td className="px-2 py-1.5">
//                         <input
//                           type="text"
//                           value={row.size}
//                           onChange={(e) =>
//                             handleSizeRowChange(idx, "size", e.target.value)
//                           }
//                           className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-black"
//                           placeholder="S / M / L / XL"
//                         />
//                       </td>
//                       <td className="px-2 py-1.5">
//                         <input
//                           type="number"
//                           value={row.qty}
//                           onChange={(e) =>
//                             handleSizeRowChange(idx, "qty", e.target.value)
//                           }
//                           className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-black"
//                           placeholder="e.g. 40"
//                         />
//                       </td>
//                       <td className="px-2 py-1.5 text-center">
//                         {sizeRows.length > 1 && (
//                           <button
//                             type="button"
//                             onClick={() => handleRemoveSizeRow(idx)}
//                             className="inline-flex items-center justify-center text-gray-400 hover:text-red-500 text-lg leading-none"
//                           >
//                             ×
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <button
//               type="button"
//               onClick={handleAddSizeRow}
//               className="mt-2 inline-flex items-center rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-[11px] text-gray-700 hover:bg-gray-50"
//             >
//               + Add size row
//             </button>
//           </div>

//           {/* Single extra info textarea */}
//           <div className="mt-3">
//             <label className="block text-[11px] text-gray-600 mb-1">
//               Extra information (internal / vendor-facing notes)
//             </label>
//             <textarea
//               value={extraInfo}
//               onChange={(e) => setExtraInfo(e.target.value)}
//               rows={3}
//               className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-black"
//               placeholder="Any additional context: quality expectations, packing instructions, special constraints, etc."
//             />
//           </div>

//           <button
//             type="button"
//             onClick={handleConfirmToPermanentLead}
//             disabled={saving}
//             className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60"
//           >
//             {saving ? "Converting..." : "Confirm & Create Permanent Lead"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/admin/TempLeadDetails.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL;

export default function TempLeadDetails() {
  const { id } = useParams(); // TempLeadStore _id
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [quantity, setQuantity] = useState("");
  const [targetCost, setTargetCost] = useState("");
  const [targetTAT, setTargetTAT] = useState(""); // date (YYYY-MM-DD)
  const [deliveryCity, setDeliveryCity] = useState("");

  // Single extra info field
  const [extraInfo, setExtraInfo] = useState("");
  // Single size ratio note
  const [sizeRatioNote, setSizeRatioNote] = useState("");

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setError("");
        setLoading(true);
        const res = await axios.get(
          `${BASE}/api/automation/temp-lead/leads/${id}`
        );
        const fullLead = res.data?.data;
        setLead(fullLead);

        if (fullLead) {
          if (fullLead.Quantity !== undefined && fullLead.Quantity !== null) {
            setQuantity(fullLead.Quantity);
          }
          if (
            fullLead.TargetCost !== undefined &&
            fullLead.TargetCost !== null
          ) {
            setTargetCost(fullLead.TargetCost);
          }

          const reqObj =
            typeof fullLead.Requirement === "object" && fullLead.Requirement
              ? fullLead.Requirement
              : {};

          if (reqObj.deliveryCity) {
            setDeliveryCity(reqObj.deliveryCity);
          }

          if (reqObj.additionalInfo) {
            setExtraInfo(reqObj.additionalInfo);
          }

          if (reqObj.sizeRatioNote) {
            setSizeRatioNote(reqObj.sizeRatioNote);
          }
        }
      } catch (err) {
        console.error("Error fetching temp lead:", err);
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load temp lead details.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLead();
    } else {
      setLoading(false);
      setError("Missing temp lead id in URL.");
    }
  }, [id]);

  const requirementSummary = () => {
    if (!lead?.Requirement) return "No requirement data.";
    const req = lead.Requirement;

    if (typeof req === "string") return req;

    if (typeof req === "object") {
      const lines = [];

      const walk = (obj, prefix = "") => {
        Object.entries(obj).forEach(([key, value]) => {
          const label =
            key.charAt(0).toUpperCase() +
            key
              .slice(1)
              .replace(/_/g, " ")
              .replace(/([A-Z])/g, " $1")
              .trim();

          if (value === null || value === undefined || value === "") return;

          // Skip meta keys shown elsewhere
          if (
            ["deliveryCity", "sizeRatioNote", "additionalInfo"].includes(key)
          ) {
            return;
          }

          if (Array.isArray(value)) {
            if (!value.length) return;
            lines.push(`${prefix}${label}: ${value.join(", ")}`);
          } else if (typeof value === "object") {
            walk(value, `${label} → `);
          } else {
            lines.push(`${prefix}${label}: ${value}`);
          }
        });
      };

      walk(req);
      if (!lines.length) return JSON.stringify(req, null, 2);
      return lines.join("\n");
    }

    return String(req);
  };

  const handleConfirmToPermanentLead = async () => {
    if (!lead) return;

    setSaving(true);
    setError("");
    setSuccessMsg("");

    const totalQtyNumber = Number(quantity) || 0;

    if (!totalQtyNumber || totalQtyNumber <= 0) {
      setError("Please enter a valid total quantity.");
      setSaving(false);
      return;
    }

    if (!targetTAT) {
      setError("Please select the target delivery date (TAT).");
      setSaving(false);
      return;
    }

    try {
      // Base Requirement
      const baseReq =
        typeof lead.Requirement === "object" && lead.Requirement
          ? { ...lead.Requirement }
          : lead.Requirement || {};

      const enhancedRequirement = { ...baseReq };

      if (deliveryCity) {
        enhancedRequirement.deliveryCity = deliveryCity;
      }
      if (sizeRatioNote) {
        enhancedRequirement.sizeRatioNote = sizeRatioNote;
      }
      if (extraInfo) {
        enhancedRequirement.additionalInfo = extraInfo;
      }

      const body = {
        CustomerName: lead.CustomerName,
        CustomerMobile: lead.CustomerMobile,
        CustomerEmail: lead.CustomerEmail,
        leadTitle: lead.leadTitle,
        Requirement: enhancedRequirement,
        referenceimages: lead.referenceimages || [],
        Quantity: totalQtyNumber,
        TargetCost: Number(targetCost) || 0,
        TargetTAT: targetTAT,
        additionalImagesOrDocs: lead.additionalImagesOrDocs || [],
        intentScore: lead.intentScore,
        max_number_of_allowed_quotes:
          lead.max_number_of_allowed_quotes || 5,
        userId: lead.userId,
        chatId: lead.chatId,
        TempLeadStoreid: lead._id,
      };

      const res = await axios.post(
        `${BASE}/api/automation/lead-management/leads`,
        body
      );

      const newLead = res.data;

      setSuccessMsg("Permanent lead created successfully.");
      setTimeout(() => setSuccessMsg(""), 2500);

      if (newLead && newLead._id) {
        navigate(`/dashboard/leads/${newLead._id}`);
      } else {
        navigate("/dashboard/leads");
      }
    } catch (err) {
      console.error("Error creating permanent lead:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to create permanent lead.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-4 min-h-[80vh] flex flex-col items-center justify-center">
        <p className="text-sm text-gray-600 mb-3">
          Temp lead not found or deleted.
        </p>
        <button
          onClick={() => navigate("/dashboard/temp-leads")}
          className="px-4 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-900"
        >
          Back to temp leads
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6" style={{ minHeight: "80vh" }}>
      <div className="max-w-4xl mx-auto space-y-4">
        <button
          className="text-xs text-gray-600 hover:text-black mb-1"
          onClick={() => navigate("/dashboard/temp-leads")}
        >
          ← Back to temp leads
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Temp Lead – Review & Confirm
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Once confirmed, this becomes an active lead visible in the Leads
              section.
            </p>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Waiting Confirmation
          </span>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            {successMsg}
          </div>
        )}

        {/* Customer + Requirement */}
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="text-[11px] uppercase text-gray-500">
                Customer
              </div>
              <div className="text-sm text-gray-900 font-medium">
                {lead.CustomerName} • {lead.CustomerEmail}
              </div>
              <div className="text-xs text-gray-600">
                {lead.CustomerMobile}
              </div>
            </div>
            <div className="text-[11px] text-gray-500">
              Temp ID:{" "}
              <span className="font-mono text-gray-800">{lead._id}</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase text-gray-500">
              Lead Title
            </div>
            <div className="text-sm text-gray-900 font-semibold">
              {lead.leadTitle}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase text-gray-500 mb-1">
              Requirement (Readable)
            </div>
            <pre className="text-xs text-gray-800 whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
              {requirementSummary()}
            </pre>
          </div>

          {lead.referenceimages?.length > 0 && (
            <div>
              <div className="text-[11px] uppercase text-gray-500 mb-1">
                Reference images
              </div>
              <div className="flex flex-wrap gap-2">
                {lead.referenceimages.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden hover:border-gray-400"
                  >
                    <img
                      src={url}
                      alt={`ref-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Inputs */}
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-semibold text-gray-900">
              Admin Inputs – Order Structuring
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">
                Total Quantity (pcs)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="e.g. 200"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">
                Target Cost (₹)
              </label>
              <input
                type="number"
                value={targetCost}
                onChange={(e) => setTargetCost(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Total or per unit"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">
                Target TAT (Delivery Date)
              </label>
              <input
                type="date"
                value={targetTAT}
                onChange={(e) => setTargetTAT(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">
                Delivery City
              </label>
              <input
                type="text"
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="e.g. Tirupur"
              />
            </div>
          </div>

          {/* Size ratio note only */}
          <div className="mt-3">
            <label className="block text-[11px] text-gray-600 mb-1">
              Size ratio note (optional)
            </label>
            <input
              type="text"
              value={sizeRatioNote}
              onChange={(e) => setSizeRatioNote(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. S – 50, M – 30, L – 20"
            />
          </div>

          {/* Single extra info textarea */}
          <div className="mt-3">
            <label className="block text-[11px] text-gray-600 mb-1">
              Extra information (internal / vendor-facing notes)
            </label>
            <textarea
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Any additional context: quality expectations, packing instructions, special constraints, etc."
            />
          </div>

          <button
            type="button"
            onClick={handleConfirmToPermanentLead}
            disabled={saving}
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60"
          >
            {saving ? "Converting..." : "Confirm & Create Permanent Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}
