// // src/pages/ManufacturerLeadPage.jsx
// import { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// const BASE = import.meta.env.VITE_BACKEND_URL;

// export default function ManufacturerLeadPage() {
//   const { leadId } = useParams(); // e.g. L0001DEC25

//   const [lead, setLead] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [identifier, setIdentifier] = useState("");
//   const [vendor, setVendor] = useState(null);
//   const [verifyError, setVerifyError] = useState("");

//   const [quoteAmount, setQuoteAmount] = useState("");
//   const [quoteFile, setQuoteFile] = useState(null);
//   const [submitError, setSubmitError] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const [paymentStatus, setPaymentStatus] = useState("none"); // "none" | "success" | "alreadyPaid"

//   const fileInputRef = useRef(null);

//   // 1) Fetch lead by leadId from URL
//   useEffect(() => {
//     const fetchLead = async () => {
//       try {
//         const res = await axios.get(`${BASE}/api/leads/public/${leadId}`);
//         setLead(res.data.lead);
//       } catch (err) {
//         console.error("Error fetching lead:", err);
//         setLead(null); // will show "Lead not found"
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (leadId) {
//       fetchLead();
//     } else {
//       setLoading(false);
//     }
//   }, [leadId]);

//   const handleVerify = async () => {
//     setVerifyError("");
//     setVendor(null);
//     setSubmitError("");

//     if (!identifier.trim()) {
//       setVerifyError("Please enter your registered email or mobile number.");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         `${BASE}/api/leads/public/${leadId}/verify`,
//         { identifier }
//       );

//       setVendor({
//         vendorId: res.data.vendorId,
//         vendorName: res.data.vendorName,
//       });

//       if (res.data.alreadyPaid) {
//         setPaymentStatus("alreadyPaid");
//       } else {
//         setPaymentStatus("none");
//       }
//     } catch (err) {
//       console.error("Verify error:", err);
//       const msg =
//         err?.response?.data?.message ||
//         "Verification failed. Please try again.";
//       setVerifyError(msg);
//     }
//   };

//   const handleEditIdentifier = () => {
//     setVendor(null);
//     setPaymentStatus("none");
//     setVerifyError("");
//   };

//   const handleQuoteFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (file) setQuoteFile(file);
//   };

//   const handleSubmitQuote = async (e) => {
//     e.preventDefault();
//     if (!vendor) {
//       setSubmitError("Please verify your email/mobile first.");
//       return;
//     }

//     if (!quoteAmount) {
//       setSubmitError("Please enter your per-piece quote.");
//       return;
//     }

//     setSubmitError("");
//     setSubmitting(true);

//     try {
//       const formData = new FormData();
//       formData.append("vendorId", vendor.vendorId);
//       formData.append("vendorName", vendor.vendorName || "");
//       formData.append("identifier", identifier);
//       formData.append("quoteAmountPerPiece", quoteAmount);
//       if (quoteFile) formData.append("quoteFile", quoteFile);

//       // Later: this can create Zoho session and redirect to payment
//       await axios.post(
//         `${BASE}/api/leads/public/${leadId}/quote`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       setPaymentStatus("success");
//       setQuoteAmount("");
//       setQuoteFile(null);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     } catch (err) {
//       console.error("Submit quote error:", err);
//       const msg =
//         err?.response?.data?.message ||
//         "Failed to submit quote. Please try again.";
//       setSubmitError(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // --- Loading state ---
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
//         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
//       </div>
//     );
//   }

//   // --- Lead missing / invalid id in URL ---
//   if (!lead) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
//         <div className="text-center text-gray-700 dark:text-gray-200">
//           Lead not found or link has expired. <br />
//           <span className="text-xs text-gray-500">
//             Please check the lead id in the URL: {leadId}
//           </span>
//         </div>
//       </div>
//     );
//   }

//   const headerSubtitle =
//     paymentStatus === "success"
//       ? "Thank you for submitting your quote. Your ₹99 payment is recorded."
//       : paymentStatus === "alreadyPaid"
//       ? "We’ve already received your quote and payment for this lead."
//       : "Please review the product details and share your best quote.";

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-3 py-6">
//       <div className="w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-[#333333] bg-white/90 dark:bg-[#101010]/95 backdrop-blur p-4 sm:p-6 shadow-lg">
//         {/* Header */}
//         <div className="mb-4 sm:mb-6">
//           <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
//             Brandgea Lead – Manufacturer Quote
//           </h1>
//           <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
//             {headerSubtitle}
//           </p>
//           <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-500">
//             Lead ID: <span className="font-mono">{lead.leadId || leadId}</span>
//           </p>
//         </div>

//         {/* Product details block */}
//         <div className="mb-5 sm:mb-6 rounded-2xl bg-slate-50 dark:bg-[#151515] border border-slate-200/70 dark:border-[#262626] px-4 py-4 sm:px-5 sm:py-5">
//           <div className="mb-3 sm:mb-4">
//             <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
//               Product
//             </div>
//             <div className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white leading-snug">
//               {lead.heading}
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-3 text-sm sm:text-base">
//             <div>
//               <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
//                 Type
//               </div>
//               <div className="text-gray-900 dark:text-gray-100 font-normal">
//                 {lead.type}
//               </div>
//             </div>
//             <div>
//               <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
//                 Quantity
//               </div>
//               <div className="text-gray-900 dark:text-gray-100 font-normal">
//                 {lead.userQuantity || "—"}
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-3 text-sm sm:text-base mt-3">
//             <div>
//               <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
//                 Target Price (User)
//               </div>
//               <div className="text-gray-900 dark:text-gray-100 font-normal">
//                 {lead.userTargetPrice
//                   ? `₹${lead.userTargetPrice.toLocaleString("en-IN")}`
//                   : "—"}
//               </div>
//             </div>
//             <div>
//               <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
//                 Needed By
//               </div>
//               <div className="text-gray-900 dark:text-gray-100 font-normal">
//                 {lead.productNeededBy || "Flexible"}
//               </div>
//             </div>
//           </div>

//           {lead.details && (
//             <div className="mt-3 sm:mt-4">
//               <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5">
//                 Other Details
//               </div>
//               <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-line">
//                 {lead.details}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* SUCCESS UI */}
//         {paymentStatus === "success" && (
//           <div className="mt-2">
//             <div className="rounded-2xl border border-green-200/70 dark:border-green-900/60 bg-green-50/90 dark:bg-green-900/15 px-4 py-4 sm:px-5 sm:py-5 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
//               <div className="flex-shrink-0">
//                 <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-md">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5 text-white"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path d="M20 6L9 17l-5-5" />
//                   </svg>
//                 </div>
//               </div>
//               <div className="flex-1">
//                 <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
//                   Quote submitted & ₹99 payment received
//                 </h2>
//                 <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
//                   We’ll share the buyer’s contact and final brief to your
//                   registered email shortly.
//                 </p>
//                 <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
//                   <li>• No need to submit this lead again.</li>
//                   <li>• Our team may contact you if any clarification is needed.</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ALREADY PAID UI */}
//         {paymentStatus === "alreadyPaid" && (
//           <div className="mt-2">
//             <div className="rounded-2xl border border-amber-200/70 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-900/15 px-4 py-4 sm:px-5 sm:py-5 flex gap-3 sm:gap-4 items-start">
//               <div className="flex-shrink-0">
//                 <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5 text-white"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//               </div>
//               <div className="flex-1">
//                 <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
//                   You’ve already paid for this lead
//                 </h2>
//                 <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
//                   Our system shows that your quote and ₹99 payment are already
//                   recorded for this lead.
//                 </p>
//                 {vendor && (
//                   <div className="mt-3 flex items-center gap-2">
//                     <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 text-[11px] text-amber-800 dark:text-amber-100 border border-amber-200/60 dark:border-amber-700/60">
//                       <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
//                       Verified as <strong>{vendor.vendorName}</strong>
//                     </span>
//                     <button
//                       type="button"
//                       onClick={handleEditIdentifier}
//                       className="text-[11px] text-amber-700 dark:text-amber-200 underline underline-offset-2"
//                     >
//                       Edit email / mobile
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* VERIFY + QUOTE – only when not yet paid */}
//         {paymentStatus === "none" && (
//           <>
//             {/* Verify section */}
//             <div className="mb-4 sm:mb-5">
//               <div className="flex items-center justify-between mb-1.5">
//                 <div className="text-sm font-semibold text-gray-900 dark:text-white">
//                   Your details
//                 </div>
//                 {vendor && (
//                   <button
//                     type="button"
//                     onClick={handleEditIdentifier}
//                     className="text-[11px] text-blue-600 dark:text-blue-400 underline underline-offset-2"
//                   >
//                     Change email / mobile
//                   </button>
//                 )}
//               </div>

//               <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
//                 Enter the email or phone number you used to register with
//                 Brandgea.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-2">
//                 <input
//                   type="text"
//                   value={identifier}
//                   onChange={(e) => setIdentifier(e.target.value)}
//                   placeholder="your@email.com or 9xxxxxxxxx"
//                   disabled={!!vendor}
//                   className={`flex-1 rounded-xl border border-gray-200 dark:border-[#333333] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
//                     vendor
//                       ? "bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 cursor-not-allowed"
//                       : "bg-white dark:bg-black text-gray-900 dark:text-white"
//                   }`}
//                 />
//                 {!vendor && (
//                   <button
//                     type="button"
//                     onClick={handleVerify}
//                     className="rounded-xl px-4 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
//                   >
//                     Verify
//                   </button>
//                 )}
//               </div>
//               {verifyError && (
//                 <p className="mt-1 text-xs text-red-500">{verifyError}</p>
//               )}
//               {vendor && (
//                 <div className="mt-2 flex items-center gap-2">
//                   <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-[11px] text-emerald-700 dark:text-emerald-100 border border-emerald-200/70 dark:border-emerald-700/60">
//                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
//                     Verified as <strong>{vendor.vendorName}</strong>
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* Quote form – only after verify */}
//             {vendor && (
//               <form
//                 onSubmit={handleSubmitQuote}
//                 className="space-y-3 sm:space-y-4"
//               >
//                 <div className="rounded-2xl border border-gray-200 dark:border-[#333333] bg-gray-50/80 dark:bg-[#151515] px-4 py-4 sm:px-5 sm:py-5">
//                   <div className="mb-3 sm:mb-4">
//                     <div className="text-sm font-semibold text-gray-900 dark:text-white">
//                       Your quote & payment (₹99)
//                     </div>
//                     <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
//                       Enter your per-piece quote in INR and pay ₹99 to unlock
//                       buyer details.
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
//                         Quote per piece (₹)
//                       </label>
//                       <div className="relative">
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
//                           ₹
//                         </span>
//                         <input
//                           type="number"
//                           step="0.01"
//                           value={quoteAmount}
//                           onChange={(e) => setQuoteAmount(e.target.value)}
//                           className="w-full rounded-xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-black pl-7 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
//                           placeholder="e.g. 245"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
//                         Attach quote file (optional)
//                       </label>
//                       <label
//                         className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-gray-300 dark:border-[#444] bg-white/80 dark:bg-black/60 px-3 py-2 cursor-pointer hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition"
//                         onClick={() => fileInputRef.current?.click()}
//                       >
//                         <span className="text-[11px] text-gray-600 dark:text-gray-300 truncate">
//                           {quoteFile
//                             ? quoteFile.name
//                             : "Upload PDF, image, or sheet"}
//                         </span>
//                         <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gray-900 text-white dark:bg-white dark:text-black">
//                           Choose file
//                         </span>
//                       </label>
//                       <input
//                         ref={fileInputRef}
//                         type="file"
//                         accept=".pdf,image/*,.xls,.xlsx,.csv"
//                         onChange={handleQuoteFileChange}
//                         className="hidden"
//                       />
//                     </div>
//                   </div>

//                   {submitError && (
//                     <p className="mt-2 text-xs text-red-500">{submitError}</p>
//                   )}

//                   <button
//                     type="submit"
//                     disabled={submitting}
//                     className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B61FF] via-[#4A76FF] to-[#0095FF] shadow-md hover:shadow-lg hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
//                   >
//                     {submitting
//                       ? "Processing ₹99 & submitting..."
//                       : "Pay ₹99 & Submit Quote"}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </>
//         )}

//         {/* Footer note */}
//         <div className="mt-4 pt-3 border-t border-gray-200 dark:border-[#333333] flex flex-col items-center gap-1">
//           <a
//             href="https://brandgea.com/terms-of-service"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-[11px] text-gray-500 dark:text-gray-400 underline underline-offset-2"
//           >
//             T&amp;C
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/ManufacturerLeadPage.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL;

// ---------- Helpers ----------

// Format quote slots as a status chip
function formatQuoteSlots(lead) {
  const max = lead.max_number_of_allowed_quotes ?? 5; // default to 5 if not sent
  const received = lead.number_of_recieved_quotes ?? 0;
  const remaining = max - received;

  if (remaining <= 0) return { text: "No slots available", type: "closed" };
  if (remaining === 1) return { text: "1 slot left", type: "urgent" };
  return { text: `${remaining} slots available`, type: "normal" };
}

function QuoteSlotChip({ type, text }) {
  const base =
    "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border";

  const styles = {
    normal:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800",
    urgent:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-700",
    closed:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700",
  };

  return <span className={`${base} ${styles[type]}`}>{text}</span>;
}

// Humanize keys like "target_cost" → "Target Cost"
function humanizeKey(key) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    // if it's already human text like "15-Feb-2026"
    return dateStr;
  }
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Convert Requirement (object/json/string) into readable lines
function requirementToLines(req) {
  if (!req) return [];

  if (typeof req === "string") {
    return [req];
  }

  if (Array.isArray(req)) {
    return req.map((item) =>
      typeof item === "string" ? item : JSON.stringify(item)
    );
  }

  if (typeof req === "object") {
    return Object.entries(req)
      .map(([key, value]) => {
        if (value === null || value === undefined || value === "") return null;

        // Skip keys we show in dedicated positions
        if (
          key === "deliveryCity" ||
          key === "deliveryDate" ||
          key === "sizeRatioTable" ||
          key === "additionalInfo"
        ) {
          return null;
        }

        // Nice label for size ratio note
        if (key === "sizeRatioNote") {
          return `Size Ratio: ${value}`;
        }

        if (typeof value === "object") {
          return `${humanizeKey(key)}: ${JSON.stringify(value)}`;
        }
        return `${humanizeKey(key)}: ${value}`;
      })
      .filter(Boolean);
  }

  return [String(req)];
}

export default function ManufacturerLeadPage() {
  const { leadId } = useParams(); // e.g. L0001DEC25

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  const [identifier, setIdentifier] = useState(""); // vendor email
  const [vendor, setVendor] = useState(null);
  const [verifyError, setVerifyError] = useState("");

  const [quoteAmount, setQuoteAmount] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState("none"); // "none" | "success" | "alreadyPaid"

  const [zohoInstance, setZohoInstance] = useState(null);
  const fileInputRef = useRef(null);

  // ---------- Load Zoho Payments SDK ----------
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://static.zohocdn.com/zpay/zpay-js/v1/zpayments.js";
    script.async = true;
    script.onload = () => {
      if (window.ZPayments) {
        const config = {
          account_id: import.meta.env.VITE_ZOHO_ACCOUNT_ID,
          domain: "IN",
          otherOptions: {
            api_key: import.meta.env.VITE_ZOHO_API_KEY,
          },
        };
        const instance = new window.ZPayments(config);
        setZohoInstance(instance);
      }
    };
    document.body.appendChild(script);
  }, []);

  // ---------- 1) Fetch lead by LeadID from URL ----------
  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await axios.get(
          `${BASE}/api/automation/lead-management/leads/active-lead-details/${leadId}`
        );
        setLead(res.data);
      } catch (err) {
        console.error("Error fetching lead:", err);
        setLead(null);
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchLead();
    } else {
      setLoading(false);
    }
  }, [leadId]);

  // ---------- Verify vendor (email + leadId) ----------
  const handleVerify = async () => {
    setVerifyError("");
    setVendor(null);
    setSubmitError("");

    if (!identifier.trim()) {
      setVerifyError("Please enter your registered email.");
      return;
    }

    try {
      const res = await axios.get(
        `${BASE}/api/automation/lead-management/check-vendor-eligibility/${encodeURIComponent(
          identifier.trim().toLowerCase()
        )}/${leadId}`
      );

      if (res.data.eligible) {
        setVendor({
          vendorEmail: res.data.vendorEmail,
          vendorName: res.data.vendorName,
          vendorPhone: res.data.vendorPhone,
        });
        setPaymentStatus("none");
      } else {
        setVerifyError("You are not eligible to quote this lead.");
      }
    } catch (err) {
      console.error("Verify error:", err);
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        "Verification failed. Please try again.";

      if (status === 404) {
        setVerifyError(
          `Vendor not found. Please complete onboarding first. 
   <a href="https://forms.gle/njzS2qjpSUJkgjhh8" 
      target="_blank" 
      rel="noopener noreferrer"
      class="underline text-blue-600 dark:text-blue-400">
      Click here to register
   </a>`
        );
      } else if (status === 409) {
        // Already quoted this lead
        setVendor({
          vendorEmail: identifier.trim().toLowerCase(),
          vendorName: "",
        });
        setPaymentStatus("alreadyPaid");
      } else {
        setVerifyError(msg);
      }
    }
  };

  const handleEditIdentifier = () => {
    setVendor(null);
    setPaymentStatus("none");
    setVerifyError("");
  };

  // ---------- Submit quote + start payment flow ----------
  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!vendor) {
      setSubmitError("Please verify your email first.");
      return;
    }

    if (!quoteAmount) {
      setSubmitError("Please enter your per-piece quote.");
      return;
    }

    if (!zohoInstance) {
      setSubmitError(
        "Payment system is still loading. Please try again in a few seconds."
      );
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    let backendData = null;

    // Helper to notify backend when widget is closed/failed
    const callWidgetResponseAPI = async (responseType, extraData = {}) => {
      try {
        if (!backendData) return;
        await axios.post(
          `${BASE}/api/automation/lead-payments/payments/widget-response`,
          {
            Lead_doc_id: backendData.Lead_doc_id,
            responseType,
            payments_session_id: backendData.paymentSessionId,
            ...extraData,
          }
        );
      } catch (error) {
        console.error(`Widget ${responseType} API error:`, error);
      }
    };

    try {
      // 1) Create Zoho payment session via backend
      const createRes = await axios.post(
        `${BASE}/api/automation/lead-payments/payments/create`,
        {
          leadId: leadId,
          vendorEmail: vendor.vendorEmail || identifier.trim().toLowerCase(),
          amountQuoted: parseFloat(quoteAmount),
          planKey: "lead_test_plan",
        }
      );

      backendData = createRes.data;

      // 2) Request payment via Zoho widget
      const displayAmount = 1;

      const options = {
        amount: String(displayAmount),
        currency_code: "INR",
        payments_session_id: backendData.paymentSessionId,
        currency_symbol: "₹",
        business: "Brandgea",
        description: `Payment for Lead ${leadId}`,
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        reference_number: backendData.Lead_doc_id || leadId,
        address: {
          name: vendor.vendorName || vendor.vendorEmail?.split("@")[0] || "",
          email: vendor.vendorEmail || identifier.trim().toLowerCase(),
          phone: vendor.vendorPhone || "",
        },
      };

      const paymentData = await zohoInstance.requestPaymentMethod(options);

      // 3) On success, notify backend success-pre-confirmation
      const successRes = await axios.post(
        `${BASE}/api/automation/lead-payments/payments/widget-success`,
        {
          Lead_doc_id: backendData.Lead_doc_id,
          payment_id: paymentData.payment_id,
          payments_session_id: backendData.paymentSessionId,
        }
      );

      console.log("✅ Payment success response:", successRes.data);

      setPaymentStatus("success");
      setQuoteAmount("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("❌ Payment widget error:", err);

      if (backendData) {
        if (err.code === "widget_closed") {
          await callWidgetResponseAPI("closed");
          setSubmitError("Payment popup closed. Quote not confirmed.");
        } else {
          await callWidgetResponseAPI("failed");
          setSubmitError(
            err.message ||
              "Payment failed. Please try again or contact support."
          );
        }
      } else {
        setSubmitError(
          err?.response?.data?.error ||
            "Failed to create payment session. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
      try {
        if (zohoInstance?.close) {
          await zohoInstance.close();
        }
      } catch (e) {
        // ignore
      }
    }
  };

  // ---------- UI States ----------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center text-gray-700 dark:text-gray-200">
          Lead not found or link has expired.
          <br />
          <span className="text-xs text-gray-500">
            Please check the lead id in the URL: {leadId}
          </span>
        </div>
      </div>
    );
  }

  const headerSubtitle =
    paymentStatus === "success"
      ? "Thank you for submitting your quote. Your ₹99 payment is recorded."
      : paymentStatus === "alreadyPaid"
      ? "We’ve already received your quote and payment for this lead."
      : "Please review the product details and share your best quote.";

  const slotInfo = formatQuoteSlots(lead);
  const requirementLines = requirementToLines(lead.Requirement || {});

  const deliveryCity = lead.Requirement?.deliveryCity || "—";
  const deliveryDate =
    lead.Requirement?.deliveryDate || formatDate(lead.TargetTAT);

  const hasTargetCost =
    lead.TargetCost !== undefined && lead.TargetCost !== null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-3 py-6">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-[#333333] bg-white/90 dark:bg-[#101010]/95 backdrop-blur p-4 sm:p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Brandgea Lead – Manufacturer Quote
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {headerSubtitle}
          </p>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-500">
            Lead ID:{" "}
            <span className="font-mono">{lead.LeadID || leadId}</span>
          </p>
        </div>

        {/* Product details block */}
        <div className="mb-5 sm:mb-6 rounded-2xl bg-slate-50 dark:bg-[#151515] border border-slate-200/70 dark:border-[#262626] px-4 py-4 sm:px-5 sm:py-5">
          <div className="mb-2 sm:mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                Product
              </div>
              <div className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-snug">
                {lead.leadTitle}
              </div>
            </div>
            <div className="mt-1 flex-shrink-0">
              <QuoteSlotChip type={slotInfo.type} text={slotInfo.text} />
            </div>
          </div>

          {/* Top priority info: Delivery + TAT + Quantity + Cost */}
          <div className="grid grid-cols-2 gap-3 text-sm sm:text-base mt-2">
            <div>
              <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                Delivery City
              </div>
              <div className="text-gray-900 dark:text-gray-100 font-normal">
                {deliveryCity}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                Delivery Date / TAT
              </div>
              <div className="text-gray-900 dark:text-gray-100 font-normal">
                {deliveryDate}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                Total Quantity
              </div>
              <div className="text-gray-900 dark:text-gray-100 font-normal">
                {lead.Quantity ?? "—"} pcs
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                Target Cost (Brand)
              </div>
              <div className="text-gray-900 dark:text-gray-100 font-normal">
                {hasTargetCost
                  ? `₹${Number(lead.TargetCost).toLocaleString("en-IN")}`
                  : "—"}
              </div>
            </div>
          </div>

          {requirementLines.length > 0 && (
            <div className="mt-3 sm:mt-4">
              <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5">
                Requirement Summary
              </div>
              <ul className="list-disc list-inside text-sm sm:text-sm text-gray-800 dark:text-gray-200 space-y-0.5">
                {requirementLines.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(lead.referenceimages) &&
            lead.referenceimages.length > 0 && (
              <div className="mt-3 sm:mt-4">
                <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5">
                  Reference Images
                </div>
                <div className="flex flex-wrap gap-2">
                  {lead.referenceimages.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-16 h-16 rounded-lg border border-gray-200 dark:border-[#333] bg-white/80 dark:bg-black/60 overflow-hidden text-[10px] text-gray-500"
                    >
                      <img
                        src={url}
                        alt={`Ref ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* SUCCESS UI */}
        {paymentStatus === "success" && (
          <div className="mt-2">
            <div className="rounded-2xl border border-green-200/70 dark:border-green-900/60 bg-green-50/90 dark:bg-green-900/15 px-4 py-4 sm:px-5 sm:py-5 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Quote submitted & ₹99 payment received
                </h2>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
                  We’ll share the buyer’s contact and final brief to your
                  registered email shortly.
                </p>
                <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  <li>• No need to submit this lead again.</li>
                  <li>
                    • Our team may contact you if any clarification is needed.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ALREADY PAID UI */}
        {paymentStatus === "alreadyPaid" && (
          <div className="mt-2">
            <div className="rounded-2xl border border-amber-200/70 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-900/15 px-4 py-4 sm:px-5 sm:py-5 flex gap-3 sm:gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  You’ve already paid for this lead
                </h2>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Our system shows that your quote and ₹99 payment are already
                  recorded for this lead.
                </p>
                {vendor && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 text-[11px] text-amber-800 dark:text-amber-100 border border-amber-200/60 dark:border-amber-700/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Verified as{" "}
                      <strong>
                        {vendor.vendorName || vendor.vendorEmail || identifier}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleEditIdentifier}
                      className="text-[11px] text-amber-700 dark:text-amber-200 underline underline-offset-2"
                    >
                      Edit email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VERIFY + QUOTE – only when not yet paid */}
        {paymentStatus === "none" && (
          <>
            {/* Verify section */}
            <div className="mb-4 sm:mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Your details
                </div>
                {vendor && (
                  <button
                    type="button"
                    onClick={handleEditIdentifier}
                    className="text-[11px] text-blue-600 dark:text-blue-400 underline underline-offset-2"
                  >
                    Change email
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Enter the <span className="font-semibold">email</span> you used
                to register with Brandgea.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="your@email.com"
                  disabled={!!vendor}
                  className={`flex-1 rounded-xl border border-gray-200 dark:border-[#333333] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    vendor
                      ? "bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-white dark:bg-black text-gray-900 dark:text-white"
                  }`}
                />
                {!vendor && (
                  <button
                    type="button"
                    onClick={handleVerify}
                    className="rounded-xl px-4 py-2 text-sm font-semibold bg-black text-white hover:opacity-90 transition"
                  >
                    Verify
                  </button>
                )}
              </div>
              {verifyError && (
                <p
                  className="mt-1 text-xs text-red-500"
                  dangerouslySetInnerHTML={{ __html: verifyError }}
                />
              )}

              {vendor && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-[11px] text-emerald-700 dark:text-emerald-100 border border-emerald-200/70 dark:border-emerald-700/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Verified as{" "}
                    <strong>
                      {vendor.vendorName || vendor.vendorEmail || identifier}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* Quote form – only after verify */}
            {vendor && (
              <form
                onSubmit={handleSubmitQuote}
                className="space-y-3 sm:space-y-4"
              >
                <div className="rounded-2xl border border-gray-200 dark:border-[#333333] bg-gray-50/80 dark:bg-[#151515] px-4 py-4 sm:px-5 sm:py-5">
                  <div className="mb-3 sm:mb-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      Your quote & payment (₹99)
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                      Enter your per-piece quote in INR and pay ₹99 to unlock
                      buyer details for this lead.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Quote per piece (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                          ₹
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={quoteAmount}
                          onChange={(e) => setQuoteAmount(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-black pl-7 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g. 245"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                        We’ll show this per-piece quote to the brand.
                      </p>
                    </div>
                  </div>

                  {submitError && (
                    <p className="mt-2 text-xs text-red-500">{submitError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B61FF] via-[#4A76FF] to-[#0095FF] shadow-md hover:shadow-lg hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? "Processing ₹99 & submitting..."
                      : "Pay ₹99 & Submit Quote"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Footer note */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-[#333333] flex flex-col items-center gap-1">
          <a
            href="https://brandgea.com/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-gray-500 dark:text-gray-400 underline underline-offset-2"
          >
            T&amp;C
          </a>
        </div>
      </div>
    </div>
  );
}


// // src/pages/ManufacturerLeadPage.jsx
// import { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// const BASE = import.meta.env.VITE_BACKEND_URL;

// // ---------- Helpers ----------

// // Format quote slots as a status chip
// function formatQuoteSlots(lead) {
//   const max = lead.max_number_of_allowed_quotes ?? 5; // default to 5 if not sent
//   const received = lead.number_of_recieved_quotes ?? 0;
//   const remaining = max - received;

//   if (remaining <= 0) return { text: "No slots available", type: "closed" };
//   if (remaining === 1) return { text: "1 slot left", type: "urgent" };
//   return { text: `${remaining} slots available`, type: "normal" };
// }

// function QuoteSlotChip({ type, text }) {
//   const base =
//     "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border";

//   const styles = {
//     normal:
//       "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800",
//     urgent:
//       "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-700",
//     closed:
//       "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700",
//   };

//   return <span className={`${base} ${styles[type]}`}>{text}</span>;
// }

// // Humanize keys like "target_cost" → "Target Cost"
// function humanizeKey(key) {
//   return key
//     .replace(/[_-]+/g, " ")
//     .replace(/\s+/g, " ")
//     .trim()
//     .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
// }

// // Convert Requirement (object/json/string) into readable lines
// function requirementToLines(req) {
//   if (!req) return [];

//   if (typeof req === "string") {
//     return [req];
//   }

//   if (Array.isArray(req)) {
//     return req.map((item) =>
//       typeof item === "string" ? item : JSON.stringify(item)
//     );
//   }

//   if (typeof req === "object") {
//     return Object.entries(req)
//       .map(([key, value]) => {
//         if (value === null || value === undefined || value === "") return null;
//         if (typeof value === "object") {
//           return `${humanizeKey(key)}: ${JSON.stringify(value)}`;
//         }
//         return `${humanizeKey(key)}: ${value}`;
//       })
//       .filter(Boolean);
//   }

//   return [String(req)];
// }

// export default function ManufacturerLeadPage() {
//   const { leadId } = useParams(); // e.g. L0001DEC25

//   const [lead, setLead] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [identifier, setIdentifier] = useState(""); // vendor email
//   const [vendor, setVendor] = useState(null);
//   const [verifyError, setVerifyError] = useState("");

//   const [quoteAmount, setQuoteAmount] = useState("");
//   // const [quoteFile, setQuoteFile] = useState(null);
//   const [submitError, setSubmitError] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const [paymentStatus, setPaymentStatus] = useState("none"); // "none" | "success" | "alreadyPaid"

//   const [zohoInstance, setZohoInstance] = useState(null);
//   const fileInputRef = useRef(null);

//   // ---------- Load Zoho Payments SDK ----------
//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "https://static.zohocdn.com/zpay/zpay-js/v1/zpayments.js";
//     script.async = true;
//     script.onload = () => {
//       if (window.ZPayments) {
//         const config = {
//           account_id: import.meta.env.VITE_ZOHO_ACCOUNT_ID,
//           domain: "IN",
//           otherOptions: {
//             api_key: import.meta.env.VITE_ZOHO_API_KEY,
//           },
//         };
//         const instance = new window.ZPayments(config);
//         setZohoInstance(instance);
//       }
//     };
//     document.body.appendChild(script);

//     return () => {
//       // clean up is mostly handled by Zoho; we just keep it simple here
//     };
//   }, []);

//   // ---------- 1) Fetch lead by LeadID from URL ----------
//   useEffect(() => {
//     const fetchLead = async () => {
//       try {
//         const res = await axios.get(
//           `${BASE}/api/automation/lead-management/leads/active-lead-details/${leadId}`
//         );
//         setLead(res.data);
//       } catch (err) {
//         console.error("Error fetching lead:", err);
//         setLead(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (leadId) {
//       fetchLead();
//     } else {
//       setLoading(false);
//     }
//   }, [leadId]);

//   // ---------- Verify vendor (email + leadId) ----------
//   const handleVerify = async () => {
//     setVerifyError("");
//     setVendor(null);
//     setSubmitError("");

//     if (!identifier.trim()) {
//       setVerifyError("Please enter your registered email.");
//       return;
//     }

//     try {
//       const res = await axios.get(
//         `${BASE}/api/automation/lead-management/check-vendor-eligibility/${encodeURIComponent(
//           identifier.trim().toLowerCase()
//         )}/${leadId}`
//       );

//       if (res.data.eligible) {
//         setVendor({
//           vendorEmail: res.data.vendorEmail,
//           vendorName: res.data.vendorName,
//           vendorPhone: res.data.vendorPhone,
//         });
//         setPaymentStatus("none");
//       } else {
//         setVerifyError("You are not eligible to quote this lead.");
//       }
//     } catch (err) {
//       console.error("Verify error:", err);
//       const status = err?.response?.status;
//       const msg =
//         err?.response?.data?.message ||
//         "Verification failed. Please try again.";

//       if (status === 404) {
//         setVerifyError(
//           `Vendor not found. Please complete onboarding first. 
//    <a href="https://forms.gle/njzS2qjpSUJkgjhh8" 
//       target="_blank" 
//       rel="noopener noreferrer"
//       class="underline text-blue-600 dark:text-blue-400">
//       Click here to register
//    </a>`
//         );
//       } else if (status === 409) {
//         // Already quoted this lead
//         setVendor({
//           vendorEmail: identifier.trim().toLowerCase(),
//           vendorName: "",
//         });
//         setPaymentStatus("alreadyPaid");
//       } else {
//         setVerifyError(msg);
//       }
//     }
//   };

//   const handleEditIdentifier = () => {
//     setVendor(null);
//     setPaymentStatus("none");
//     setVerifyError("");
//   };

//   // const handleQuoteFileChange = (e) => {
//   //   const file = e.target.files?.[0];
//   //   if (file) setQuoteFile(file);
//   // };

//   // ---------- Submit quote + start payment flow ----------
//   const handleSubmitQuote = async (e) => {
//     e.preventDefault();
//     if (!vendor) {
//       setSubmitError("Please verify your email first.");
//       return;
//     }

//     if (!quoteAmount) {
//       setSubmitError("Please enter your per-piece quote.");
//       return;
//     }

//     if (!zohoInstance) {
//       setSubmitError(
//         "Payment system is still loading. Please try again in a few seconds."
//       );
//       return;
//     }

//     setSubmitError("");
//     setSubmitting(true);

//     let backendData = null;

//     // Helper to notify backend when widget is closed/failed
//     const callWidgetResponseAPI = async (responseType, extraData = {}) => {
//       try {
//         if (!backendData) return;
//         await axios.post(
//           `${BASE}/api/automation/lead-payments/payments/widget-response`,
//           {
//             Lead_doc_id: backendData.Lead_doc_id,
//             responseType,
//             payments_session_id: backendData.paymentSessionId,
//             ...extraData,
//           }
//         );
//       } catch (error) {
//         console.error(`Widget ${responseType} API error:`, error);
//       }
//     };

//     try {
//       // 1) Create Zoho payment session via backend
//       const createRes = await axios.post(
//         `${BASE}/api/automation/lead-payments/payments/create`,
//         {
//           leadId: leadId, // can be L0001DEC25 or ObjectId; backend handles both
//           vendorEmail: vendor.vendorEmail || identifier.trim().toLowerCase(),
//           amountQuoted: parseFloat(quoteAmount), // per-piece or total; your choice
//           planKey: "basic_plan_99", // assuming this = ₹99 plan in PAYMENT_KEYS
//         }
//       );

//       backendData = createRes.data;

//       // 2) Request payment via Zoho widget
//       const displayAmount = 99; // purely UI; backend session controls real amount

//       const options = {
//         amount: String(displayAmount),
//         currency_code: "INR",
//         payments_session_id: backendData.paymentSessionId,
//         currency_symbol: "₹",
//         business: "Brandgea",
//         description: `Payment for Lead ${leadId}`,
//         invoice_number: `INV-${Date.now().toString().slice(-6)}`,
//         reference_number: backendData.Lead_doc_id || leadId,
//         address: {
//           name: vendor.vendorName || vendor.vendorEmail?.split("@")[0] || "",
//           email: vendor.vendorEmail || identifier.trim().toLowerCase(),
//           phone: vendor.vendorPhone || "",
//         },
//       };

//       const paymentData = await zohoInstance.requestPaymentMethod(options);

//       // 3) On success, notify backend success-pre-confirmation
//       const successRes = await axios.post(
//         `${BASE}/api/automation/lead-payments/payments/widget-success`,
//         {
//           Lead_doc_id: backendData.Lead_doc_id,
//           payment_id: paymentData.payment_id,
//           payments_session_id: backendData.paymentSessionId,
//         }
//       );

//       console.log("✅ Payment success response:", successRes.data);

//       setPaymentStatus("success");
//       setQuoteAmount("");
//       setQuoteFile(null);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     } catch (err) {
//       console.error("❌ Payment widget error:", err);

//       if (backendData) {
//         if (err.code === "widget_closed") {
//           await callWidgetResponseAPI("closed");
//           setSubmitError("Payment popup closed. Quote not confirmed.");
//         } else {
//           await callWidgetResponseAPI("failed");
//           setSubmitError(
//             err.message ||
//               "Payment failed. Please try again or contact support."
//           );
//         }
//       } else {
//         setSubmitError(
//           err?.response?.data?.error ||
//             "Failed to create payment session. Please try again."
//         );
//       }
//     } finally {
//       setSubmitting(false);
//       try {
//         if (zohoInstance?.close) {
//           await zohoInstance.close();
//         }
//       } catch (e) {
//         // ignore
//       }
//     }
//   };

//   // ---------- UI States ----------

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
//         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
//       </div>
//     );
//   }

//   if (!lead) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
//         <div className="text-center text-gray-700 dark:text-gray-200">
//           Lead not found or link has expired.
//           <br />
//           <span className="text-xs text-gray-500">
//             Please check the lead id in the URL: {leadId}
//           </span>
//         </div>
//       </div>
//     );
//   }

//   const headerSubtitle =
//     paymentStatus === "success"
//       ? "Thank you for submitting your quote. Your ₹99 payment is recorded."
//       : paymentStatus === "alreadyPaid"
//       ? "We’ve already received your quote and payment for this lead."
//       : "Please review the product details and share your best quote.";

//   const slotInfo = formatQuoteSlots(lead);
//   const requirementLines = requirementToLines(lead.Requirement);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-3 py-6">
//       <div className="w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-[#333333] bg-white/90 dark:bg-[#101010]/95 backdrop-blur p-4 sm:p-6 shadow-lg">
//         {/* Header */}
//         <div className="mb-4 sm:mb-6">
//           <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
//             Brandgea Lead – Manufacturer Quote
//           </h1>
//           <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
//             {headerSubtitle}
//           </p>
//           <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-500">
//             Lead ID: <span className="font-mono">{lead.LeadID || leadId}</span>
//           </p>
//         </div>

//         {/* Product details block */}
//         <div className="mb-5 sm:mb-6 rounded-2xl bg-slate-50 dark:bg-[#151515] border border-slate-200/70 dark:border-[#262626] px-4 py-4 sm:px-5 sm:py-5">
//           <div className="mb-2 sm:mb-3 flex items-start justify-between gap-3">
//             <div>
//               <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
//                 Product
//               </div>
//               <div className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-snug">
//                 {lead.leadTitle}
//               </div>
//             </div>
//             <div className="mt-1 flex-shrink-0">
//               <QuoteSlotChip type={slotInfo.type} text={slotInfo.text} />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-3 text-sm sm:text-base mt-1">
//             <div>
//               <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
//                 Quantity
//               </div>
//               <div className="text-gray-900 dark:text-gray-100 font-normal">
//                 {lead.Quantity ?? "—"}
//               </div>
//             </div>
//             <div>
//               <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
//                 Target Cost (Brand)
//               </div>
//               <div className="text-gray-900 dark:text-gray-100 font-normal">
//                 {lead.TargetCost
//                   ? `₹${lead.TargetCost.toLocaleString("en-IN")}`
//                   : "—"}
//               </div>
//             </div>
//           </div>

//           {requirementLines.length > 0 && (
//             <div className="mt-3 sm:mt-4">
//               <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5">
//                 Requirement Summary
//               </div>
//               <ul className="list-disc list-inside text-sm sm:text-base text-gray-800 dark:text-gray-200 space-y-0.5">
//                 {requirementLines.map((line, idx) => (
//                   <li key={idx}>{line}</li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {Array.isArray(lead.referenceimages) &&
//             lead.referenceimages.length > 0 && (
//               <div className="mt-3 sm:mt-4">
//                 <div className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5">
//                   Reference Images
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {lead.referenceimages.map((url, idx) => (
//                     <a
//                       key={idx}
//                       href={url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center justify-center w-16 h-16 rounded-lg border border-gray-200 dark:border-[#333] bg-white/80 dark:bg-black/60 overflow-hidden text-[10px] text-gray-500"
//                     >
//                       <img
//                         src={url}
//                         alt={`Ref ${idx + 1}`}
//                         className="w-full h-full object-cover"
//                       />
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             )}
//         </div>

//         {/* SUCCESS UI */}
//         {paymentStatus === "success" && (
//           <div className="mt-2">
//             <div className="rounded-2xl border border-green-200/70 dark:border-green-900/60 bg-green-50/90 dark:bg-green-900/15 px-4 py-4 sm:px-5 sm:py-5 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
//               <div className="flex-shrink-0">
//                 <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-md">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5 text-white"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path d="M20 6L9 17l-5-5" />
//                   </svg>
//                 </div>
//               </div>
//               <div className="flex-1">
//                 <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
//                   Quote submitted & ₹99 payment received
//                 </h2>
//                 <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
//                   We’ll share the buyer’s contact and final brief to your
//                   registered email shortly.
//                 </p>
//                 <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
//                   <li>• No need to submit this lead again.</li>
//                   <li>
//                     • Our team may contact you if any clarification is needed.
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ALREADY PAID UI */}
//         {paymentStatus === "alreadyPaid" && (
//           <div className="mt-2">
//             <div className="rounded-2xl border border-amber-200/70 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-900/15 px-4 py-4 sm:px-5 sm:py-5 flex gap-3 sm:gap-4 items-start">
//               <div className="flex-shrink-0">
//                 <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5 text-white"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//               </div>
//               <div className="flex-1">
//                 <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
//                   You’ve already paid for this lead
//                 </h2>
//                 <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
//                   Our system shows that your quote and ₹99 payment are already
//                   recorded for this lead.
//                 </p>
//                 {vendor && (
//                   <div className="mt-3 flex items-center gap-2">
//                     <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 text-[11px] text-amber-800 dark:text-amber-100 border border-amber-200/60 dark:border-amber-700/60">
//                       <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
//                       Verified as{" "}
//                       <strong>
//                         {vendor.vendorName || vendor.vendorEmail || identifier}
//                       </strong>
//                     </span>
//                     <button
//                       type="button"
//                       onClick={handleEditIdentifier}
//                       className="text-[11px] text-amber-700 dark:text-amber-200 underline underline-offset-2"
//                     >
//                       Edit email
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* VERIFY + QUOTE – only when not yet paid */}
//         {paymentStatus === "none" && (
//           <>
//             {/* Verify section */}
//             <div className="mb-4 sm:mb-5">
//               <div className="flex items-center justify-between mb-1.5">
//                 <div className="text-sm font-semibold text-gray-900 dark:text-white">
//                   Your details
//                 </div>
//                 {vendor && (
//                   <button
//                     type="button"
//                     onClick={handleEditIdentifier}
//                     className="text-[11px] text-blue-600 dark:text-blue-400 underline underline-offset-2"
//                   >
//                     Change email
//                   </button>
//                 )}
//               </div>

//               <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
//                 Enter the <span className="font-semibold">email</span> you used
//                 to register with Brandgea.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-2">
//                 <input
//                   type="email"
//                   value={identifier}
//                   onChange={(e) => setIdentifier(e.target.value)}
//                   placeholder="your@email.com"
//                   disabled={!!vendor}
//                   className={`flex-1 rounded-xl border border-gray-200 dark:border-[#333333] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
//                     vendor
//                       ? "bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 cursor-not-allowed"
//                       : "bg-white dark:bg-black text-gray-900 dark:text-white"
//                   }`}
//                 />
//                 {!vendor && (
//                   <button
//                     type="button"
//                     onClick={handleVerify}
//                     className="rounded-xl px-4 py-2 text-sm font-semibold bg-black text-white dark:bg:white dark:text-black hover:opacity-90 transition"
//                   >
//                     Verify
//                   </button>
//                 )}
//               </div>
//               {verifyError && (
//                 <p
//                   className="mt-1 text-xs text-red-500"
//                   dangerouslySetInnerHTML={{ __html: verifyError }}
//                 />
//               )}

//               {vendor && (
//                 <div className="mt-2 flex items-center gap-2">
//                   <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-[11px] text-emerald-700 dark:text-emerald-100 border border-emerald-200/70 dark:border-emerald-700/60">
//                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
//                     Verified as{" "}
//                     <strong>
//                       {vendor.vendorName || vendor.vendorEmail || identifier}
//                     </strong>
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* Quote form – only after verify */}
//             {vendor && (
//               <form
//                 onSubmit={handleSubmitQuote}
//                 className="space-y-3 sm:space-y-4"
//               >
//                 <div className="rounded-2xl border border-gray-200 dark:border-[#333333] bg-gray-50/80 dark:bg-[#151515] px-4 py-4 sm:px-5 sm:py-5">
//                   <div className="mb-3 sm:mb-4">
//                     <div className="text-sm font-semibold text-gray-900 dark:text-white">
//                       Your quote & payment (₹99)
//                     </div>
//                     <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
//                       Enter your per-piece quote in INR and pay ₹99 to unlock
//                       buyer details for this lead.
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
//                         Quote per piece (₹)
//                       </label>
//                       <div className="relative">
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
//                           ₹
//                         </span>
//                         <input
//                           type="number"
//                           step="0.01"
//                           value={quoteAmount}
//                           onChange={(e) => setQuoteAmount(e.target.value)}
//                           className="w-full rounded-xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-black pl-7 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
//                           placeholder="e.g. 245"
//                         />
//                       </div>
//                       <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
//                         We’ll show this per-piece quote to the brand.
//                       </p>
//                     </div>

//                     {/* <div>
//                       <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
//                         Attach quote file (optional)
//                       </label>
//                       <label
//                         className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-gray-300 dark:border-[#444] bg-white/80 dark:bg-black/60 px-3 py-2 cursor-pointer hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition"
//                         onClick={() => fileInputRef.current?.click()}
//                       >
//                         <span className="text-[11px] text-gray-600 dark:text-gray-300 truncate">
//                           {quoteFile
//                             ? quoteFile.name
//                             : "Upload PDF, image, or sheet"}
//                         </span>
//                         <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gray-900 text-white dark:bg-white dark:text-black">
//                           Choose file
//                         </span>
//                       </label>
//                       <input
//                         ref={fileInputRef}
//                         type="file"
//                         accept=".pdf,image/*,.xls,.xlsx,.csv"
//                         onChange={handleQuoteFileChange}
//                         className="hidden"
//                       />
//                     </div> */}
//                   </div>

//                   {submitError && (
//                     <p className="mt-2 text-xs text-red-500">{submitError}</p>
//                   )}

//                   <button
//                     type="submit"
//                     disabled={submitting}
//                     className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B61FF] via-[#4A76FF] to-[#0095FF] shadow-md hover:shadow-lg hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
//                   >
//                     {submitting
//                       ? "Processing ₹99 & submitting..."
//                       : "Pay ₹99 & Submit Quote"}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </>
//         )}

//         {/* Footer note */}
//         <div className="mt-4 pt-3 border-t border-gray-200 dark:border-[#333333] flex flex-col items-center gap-1">
//           <a
//             href="https://brandgea.com/terms-of-service"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-[11px] text-gray-500 dark:text-gray-400 underline underline-offset-2"
//           >
//             T&amp;C
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// }
