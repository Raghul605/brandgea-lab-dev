// import React, { useMemo, useState } from "react";
// import ContactFormModal from "../Dashboard/ContactFormModal";
// import { useAuth } from "../../context/AuthContext";

// const normalizeImageUrls = (msg) => {
//   const raw =
//     msg?.imageUrls ||
//     msg?.gptResponse?.imageUrls ||
//     msg?.images ||
//     msg?.gptResponse?.images ||
//     [];
//   return Array.isArray(raw) ? raw.filter(Boolean) : [];
// };

// // Currency formatter
// const formatCurrency = (amount, currency = "INR") => {
//   const n = Number(amount || 0);
//   try {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency,
//       maximumFractionDigits: 0,
//     }).format(n);
//   } catch {
//     return `${n.toLocaleString("en-IN")} ${currency}`;
//   }
// };

// const Pill = ({ children }) => (
//   <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700">
//     {children}
//   </span>
// );

// function CostsTable({ costs }) {
//   const rows = useMemo(() => {
//     if (!costs) return [];
//     const { currency = "INR", ...tiers } = costs;
//     return Object.entries(tiers)
//       .filter(([k]) => k !== "currency")
//       .map(([qty, price]) => ({
//         qty: Number(qty),
//         price: Number(price),
//         currency,
//       }))
//       .sort((a, b) => a.qty - b.qty);
//   }, [costs]);

//   if (!rows.length) return null;

//   const currency = costs?.currency || "INR";

//   return (
//     <div className="space-y-3">
//       <div className="hidden md:block overflow-hidden rounded-2xl">
//         <div className="max-h-72 overflow-auto">
//           <table className="w-full text-sm border border-gray-200 rounded-2xl bg-white">
//             <thead className="sticky top-0 bg-gray-50">
//               <tr>
//                 <th className="text-left py-2.5 px-3 font-semibold text-gray-700">
//                   Quantity
//                 </th>
//                 <th className="text-left py-2.5 px-3 font-semibold text-gray-700">
//                   Price / unit
//                 </th>
//                 <th className="text-left py-2.5 px-3 font-semibold text-gray-700">
//                   Total
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {rows.map((r) => (
//                 <tr
//                   key={r.qty}
//                   className="even:bg-gray-50/50 border-t border-gray-100"
//                 >
//                   <td className="py-2.5 px-3 text-gray-900">
//                     {r.qty.toLocaleString("en-IN")} pcs
//                   </td>
//                   <td className="py-2.5 px-3 text-gray-800">
//                     {formatCurrency(r.price, currency)}
//                   </td>
//                   <td className="py-2.5 px-3 font-semibold text-gray-900">
//                     {formatCurrency(r.qty * r.price, currency)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-3 md:hidden">
//         {rows.map((r) => (
//           <div
//             key={r.qty}
//             className="bg-white rounded-xl border border-gray-200 p-3 text-center"
//           >
//             <div className="text-xs text-gray-500 mb-1">{r.qty} pcs</div>
//             <div className="text-base font-bold text-gray-900">
//               {formatCurrency(r.price, currency)}
//             </div>
//             <div className="text-[11px] text-gray-500 mt-0.5">
//               Total {formatCurrency(r.qty * r.price, currency)}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function TechPackList({ data }) {
//   if (!data) return null;
//   const rows = [
//     { label: "Garment Type", value: data.garment_type },
//     { label: "Material", value: data.material },
//     { label: "GSM", value: data.gsm },
//     { label: "Technology", value: data.tech },
//   ];
//   const colors = Array.isArray(data.color) ? data.color : [];
//   const washes = Array.isArray(data.wash_treatments)
//     ? data.wash_treatments
//     : [];

//   return (
//     <div className="space-y-3">
//       {rows.map((r) => (
//         <div
//           key={r.label}
//           className="flex items-baseline justify-between border-b border-gray-100 pb-2 last:border-none"
//         >
//           <span className="text-[11px] uppercase tracking-wide text-gray-500">
//             {r.label}
//           </span>
//           <span className="text-sm font-medium text-gray-900 ml-4 text-right">
//             {r.value ?? "—"}
//           </span>
//         </div>
//       ))}

//       <div className="border-b border-gray-100 pb-2">
//         <span className="text-[11px] uppercase tracking-wide text-gray-500">
//           Colors
//         </span>
//         <div className="mt-1 flex flex-wrap gap-1.5">
//           {colors.length ? (
//             colors.map((c, i) => <Pill key={i}>{c}</Pill>)
//           ) : (
//             <span className="text-sm text-gray-500">—</span>
//           )}
//         </div>
//       </div>

//       <div className="border-b border-gray-100 pb-2">
//         <span className="text-[11px] uppercase tracking-wide text-gray-500">
//           Wash Treatments
//         </span>
//         <div className="mt-1 flex flex-wrap gap-1.5">
//           {washes.length ? (
//             washes.map((w, i) => <Pill key={i}>{w}</Pill>)
//           ) : (
//             <span className="text-sm text-gray-500">—</span>
//           )}
//         </div>
//       </div>

//       {data.additional_comments && (
//         <div>
//           <span className="text-[11px] uppercase tracking-wide text-gray-500">
//             Comments
//           </span>
//           <p className="text-sm text-gray-800 leading-relaxed mt-1">
//             {data.additional_comments}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

// function SummaryMessage({ content, onConfirm }) {
//   return (
//     <div className="bg-white rounded-2xl p-5 max-w-4xl w-full border border-gray-200">
//       <div className="flex items-center mb-4">
//         <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
//           AI
//         </div>
//         <div className="ml-3">
//           <h3 className="font-semibold text-gray-800">Product Summary</h3>
//         </div>
//       </div>

//       <div className="bg-gray-50 rounded-xl p-4 mb-4">
//         <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
//           {content}
//         </pre>
//       </div>

//       <div className="flex justify-center gap-3">
//         <button
//           onClick={() => onConfirm("yes")}
//           className="bg-[#060A21] text-white font-medium py-2 px-6 rounded-full text-sm"
//         >
//           Yes, generate quote
//         </button>
//         <button
//           onClick={() => onConfirm("no")}
//           className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-full text-sm transition-colors"
//         >
//           Make changes
//         </button>
//       </div>
//     </div>
//   );
// }

// export default function Message({ message, onGenerateQuote }) {
//   const [isContactModalOpen, setIsContactModalOpen] = useState(false);
//   const { user } = useAuth();
//   const imageUrls = normalizeImageUrls(message);

//   console.groupCollapsed(
//   "[Message] images",
//   { id: message?.id || message?._id || message?.chatId, role: message?.role }
// );
// console.log("message.imageUrls:", message?.imageUrls);
// console.log("message.gptResponse?.imageUrls:", message?.gptResponse?.imageUrls);
// console.log("message.images:", message?.images);
// console.log("message.gptResponse?.images:", message?.gptResponse?.images);
// console.log("normalized imageUrls:", imageUrls);
// console.table(
//   (imageUrls || []).map((u, i) => ({ idx: i, url: u, type: typeof u }))
// );
// console.groupEnd();

//   if (message.role === "user") {
//     return (
//       <div className="flex justify-end mb-4 px-2 sm:px-0">
//         <div className="flex flex-col items-end max-w-[90%] sm:max-w-[75%] lg:max-w-[60%] xl:max-w-[50%]">
//           <div className="bg-[#EDEFF1] text-[#060A21] text-sm rounded-3xl rounded-br-md px-4 py-3">
//             <p className="text-sm">{message.content}</p>
//           </div>

//           {imageUrls.length > 0 && (
//             <div className="mt-2 grid grid-cols-2 gap-2">
//               {imageUrls.map((url, idx) => (
//                 <div key={idx} className="relative group">
//                   <img
//                     src={url}
//                     alt={`Uploaded ${idx + 1}`}
//                     className="w-full h-32 object-cover rounded-lg shadow-md transition-transform duration-200 group-hover:scale-105"
//                   />
//                   <a
//                     href={url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg text-white text-xs font-medium"
//                   >
//                     Open
//                   </a>
//                 </div>
//               ))}
//             </div>
//           )}

//           {message.timestamp && (
//             <span className="text-xs text-gray-500 mt-1">
//               {new Date(message.timestamp).toLocaleTimeString()}
//             </span>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // Handle different AI response types
//   const techPackData =
//     message.techPack ||
//     (message.gptResponse &&
//       (message.gptResponse.tech_pack || message.gptResponse));
//   const manufacturingCosts =
//     message.manufacturingCosts ||
//     (message.gptResponse &&
//       (message.gptResponse.manufacturing_costs ||
//         message.gptResponse.manufacturingCosts));

//   // Check if this is a summary message asking for confirmation
//   const isSummaryWithConfirmation =
//     message.gptResponse &&
//     message.gptResponse.summary &&
//     message.gptResponse.summary.includes("Are these details correct?");

//   // Handle question responses
//   if (message.gptResponse && message.gptResponse.question) {
//     return (
//       <div className="flex justify-start mb-4 px-2 sm:px-0">
//         <div className="flex flex-col items-start max-w-[90%] sm:max-w-[75%] lg:max-w-[90%] xl:max-w-[50%]">
//           <div className=" text-gray-800  px-4">
//             <p className="text-sm">{message.gptResponse.question}</p>
//           </div>
//           {/* {message.timestamp && (
//             <span className="text-xs text-gray-500 mt-1 ml-2">
//               {new Date(message.timestamp).toLocaleTimeString()}
//             </span>
//           )} */}
//         </div>
//       </div>
//     );
//   }

//   // Handle summary with confirmation request
//   if (isSummaryWithConfirmation) {
//     return (
//       <div className="flex justify-start mb-6 px-2 sm:px-0">
//         <SummaryMessage
//           content={message.gptResponse.summary}
//           onConfirm={onGenerateQuote}
//         />
//       </div>
//     );
//   }

//   // Handle final response with tech pack and manufacturing costs
//   if (techPackData && manufacturingCosts) {
//     const currency = manufacturingCosts?.currency || "INR";

//     return (
//       <div className="flex justify-start mb-6 px-2 sm:px-0">
//         <div className="bg-white rounded-2xl p-5 max-w-4xl w-full border border-gray-200">
//           <div className="flex items-center mb-6">
//             <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold">
//               AI
//             </div>
//             <div className="ml-3">
//               <h3 className="font-semibold text-gray-800">
//                 Product Analysis Complete
//               </h3>
//               {/* {message.timestamp && (
//                 <p className="text-xs text-gray-500">
//                   {new Date(message.timestamp).toLocaleString()}
//                 </p>
//               )} */}
//             </div>
//           </div>

//           {imageUrls.length > 0 && (
//             <div className="mt-6">
//               <h4 className="text-lg font-semibold text-gray-800 mb-3">
//                 Reference Images
//               </h4>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                 {imageUrls.map((url, index) => (
//                   <div key={index} className="relative group">
//                     <img
//                       src={url}
//                       alt={`Reference ${index + 1}`}
//                       className="w-full h-40 object-cover rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-105"
//                     />
//                     <a
//                       href={url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg text-white text-xs font-medium"
//                     >
//                       Open
//                     </a>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="mb-6">
//             <h4 className="text-lg font-semibold text-gray-800 mb-3">
//               Tech Pack Details
//             </h4>
//             <TechPackList data={techPackData} />
//           </div>

//           <div className="space-y-3 mb-6">
//             <div className="flex items-center justify-between">
//               <h4 className="text-lg font-semibold text-gray-800">
//                 Manufacturing Costs
//               </h4>
//               <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700">
//                 Currency: {currency}
//               </span>
//             </div>
//             <div className="p-0">
//               <CostsTable costs={manufacturingCosts} />
//             </div>
//           </div>

//           <div className="flex justify-center pt-5">
//             <button
//               onClick={() => setIsContactModalOpen(true)}
//               className="bg-[#060A21] text-sm text-white font-medium py-2.5 px-4 rounded-full hover:opacity-95"
//             >
//               Contact Manufacturer
//             </button>
//           </div>
//         </div>

//         {isContactModalOpen && (
//           <ContactFormModal
//             isOpen={isContactModalOpen}
//             onClose={() => setIsContactModalOpen(false)}
//             userProfile={user}
//             quoteData={{
//               pricing: manufacturingCosts,
//               techPack: techPackData,
//               chatId: message.chatId,
//             }}
//           />
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="flex justify-start mb-4 px-2 sm:px-0">
//       <div className="flex flex-col items-start max-w-[90%] sm:max-w-[75%] lg:max-w-[90%] xl:max-w-[80%]">
//         <div className=" text-gray-800 rounded-3xl rounded-bl-md px-4 py-3">
//           <p className="text-sm">{message.content}</p>
//         </div>
//         {/* {message.timestamp && (
//           <span className="text-xs text-gray-500 mt-1 ml-2">
//             {new Date(message.timestamp).toLocaleTimeString()}
//           </span>
//         )} */}
//       </div>
//     </div>
//   );
// }

//////////////////////////////////////////////////////

// import React, { useMemo, useState } from "react";
// import ContactFormModal from "../Dashboard/ContactFormModal";
// import { useAuth } from "../../context/AuthContext";
// import ManufacturerPurchase from "./ManufacturerPurchase";

// const normalizeImageUrls = (msg) => {
//   const raw =
//     msg?.imageUrls ||
//     msg?.gptResponse?.imageUrls ||
//     msg?.images ||
//     msg?.gptResponse?.images ||
//     [];
//   return Array.isArray(raw) ? raw.filter(Boolean) : [];
// };

// // Currency formatter
// const formatCurrency = (amount, currency = "INR") => {
//   const n = Number(amount || 0);
//   try {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency,
//       maximumFractionDigits: 0,
//     }).format(n);
//   } catch {
//     return `${n.toLocaleString("en-IN")} ${currency}`;
//   }
// };

// function CostsTable({ costs }) {
//   const rows = useMemo(() => {
//     if (!costs) return [];
//     const { currency = "INR", ...tiers } = costs;
//     return Object.entries(tiers)
//       .filter(([k]) => k !== "currency")
//       .map(([qty, price]) => ({
//         qty: Number(qty),
//         price: Number(price),
//         currency,
//       }))
//       .sort((a, b) => a.qty - b.qty);
//   }, [costs]);

//   if (!rows.length) return null;

//   const currency = costs?.currency || "INR";

//   return (
//     <div className="space-y-3">
//       <div className="hidden md:block overflow-hidden rounded-2xl">
//         <div className="max-h-72 overflow-auto">
//           <table className="w-full text-sm border border-gray-200 dark:border-[#333333] rounded-2xl bg-white dark:bg-black">
//             <thead className="sticky top-0 bg-gray-50 dark:bg-black">
//               <tr>
//                 <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-200">
//                   Quantity
//                 </th>
//                 <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-200">
//                   Price / unit
//                 </th>
//                 <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-200">
//                   Total
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {rows.map((r) => (
//                 <tr
//                   key={r.qty}
//                   className="even:bg-gray-50/50 dark:even:bg-[#151515] border-t border-gray-100 dark:border-[#333333]"
//                 >
//                   <td className="py-3 px-3 text-gray-900 dark:text-white">
//                     {r.qty.toLocaleString("en-IN")} pcs
//                   </td>
//                   <td className="py-3 px-3 text-gray-800 dark:text-white">
//                     {formatCurrency(r.price, currency)}
//                   </td>
//                   <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">
//                     {formatCurrency(r.qty * r.price, currency)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Mobile Card */}
//       <div className="grid grid-cols-2 gap-2 sm:gap-3 md:hidden">
//         {rows.map((r) => (
//           <div
//             key={r.qty}
//             className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-[#333333] p-3 text-center"
//           >
//             <div className="text-[11px] sm:text-xs text-gray-500 dark:text-white mb-0.5">
//               {r.qty} pcs
//             </div>
//             <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
//               {formatCurrency(r.price, currency)}
//             </div>
//             <div className="text-[10px] sm:text-[11px]  text-gray-500 dark:text-gray-300 mt-0.5">
//               Total {formatCurrency(r.qty * r.price, currency)}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function TechPackList({ data }) {
//   if (!data) return null;

//   const colors = Array.isArray(data.color) ? data.color : [];
//   const washes = Array.isArray(data.wash_treatments)
//     ? data.wash_treatments
//     : [];

//   const designs = Array.isArray(data.design)
//     ? data.design
//     : typeof data.design === "string"
//     ? data.design
//     : [];

//   const toText = (val) => {
//     if (Array.isArray(val)) {
//       if (!val.length) return "—";
//       return val.join(", ");
//     }
//     return val ?? "—";
//   };
//   const designValue = Array.isArray(designs)
//     ? designs.map((d) => `${d?.placement || "—"} • ${d?.type || "—"}`)
//     : designs;

//   const rows = [
//     { label: "Garment Type", value: toText(data.garment_type) },
//     { label: "Material", value: toText(data.material) },
//     { label: "GSM", value: toText(data.gsm) },
//     { label: "Technology", value: toText(data.tech) },
//     { label: "Design", value: toText(designValue) },
//     { label: "Colors", value: toText(colors) },
//     { label: "Wash Treatments", value: toText(washes) },
//   ];
//   return (
//     <div className="divide-y divide-gray-100 dark:divide-[#333333]">
//       {rows.map((r) => (
//         <div
//           key={r.label}
//           className="py-2 sm:py-2.5 flex items-start justify-between gap-2 sm:gap-3"
//         >
//           <span className="text-[10px] sm:text-[11px] uppercase tracking-wide text-gray-800 dark:text-gray-200">
//             {r.label}
//           </span>
//           <div className="min-w-0 flex-1 text-right">
//             <span className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white ml-3 sm:ml-4 break-words">
//               {r.value}
//             </span>
//           </div>
//         </div>
//       ))}

//       {data.additional_comments && (
//         <div className="py-2 sm:py-2.5 flex items-start justify-between gap-3">
//           <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-200">
//             Comments
//           </span>
//           <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed ml-4 text-right">
//             {data.additional_comments}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

// function SummaryMessage({ content, onConfirm }) {
//   return (
//     <div className="bg-white rounded-2xl p-5 max-w-4xl w-full border border-gray-200">
//       <div className="flex items-center mb-4">
//         <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
//           AI
//         </div>
//         <div className="ml-3">
//           <h3 className="font-semibold text-gray-800">Product Summary</h3>
//         </div>
//       </div>

//       <div className="bg-gray-50 rounded-xl p-4 mb-4">
//         <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
//           {content}
//         </pre>
//       </div>

//       <div className="flex justify-center gap-3">
//         <button
//           onClick={() => onConfirm("yes")}
//           className="bg-[#060A21] text-white font-medium py-2 px-6 rounded-full text-sm"
//         >
//           Yes, generate quote
//         </button>
//         <button
//           onClick={() => onConfirm("no")}
//           className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-full text-sm transition-colors"
//         >
//           Make changes
//         </button>
//       </div>
//     </div>
//   );
// }

// export default function Message({
//   message,
//   onGenerateQuote,
//   isHistory = false,
// }) {
//   const [isContactModalOpen, setIsContactModalOpen] = useState(false);
//   const { user } = useAuth();
//   const imageUrls = normalizeImageUrls(message);

//   if (message.role === "user") {
//     const showUserImages = !isHistory && imageUrls.length > 0;
//     return (
//       <div className="flex justify-end mb-4 px-2 sm:px-0">
//         <div className="flex flex-col items-end max-w-[90%] sm:max-w-[75%] lg:max-w-[60%] xl:max-w-[50%]">
//           {showUserImages && (
//             <div className="mt-2 grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 gap-1.5 sm:gap-2">
//               {imageUrls.map((url, idx) => (
//                 <div
//                   key={idx}
//                   className="relative group w-20 sm:w-28 md:w-32 aspect-square"
//                 >
//                   <img
//                     src={url}
//                     alt={`Uploaded ${idx + 1}`}
//                     className="w-full h-full object-cover rounded-lg shadow-sm"
//                   />
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="mt-2 bg-[#EDEFF1] text-[#060A21] text-[13px] sm:text-sm rounded-2xl rounded-br-md px-3 sm:px-4 py-2.5 sm:py-3">
//             <p className="text-sm">{message.content}</p>
//           </div>

//           {/* {message.timestamp && (
//             <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
//               {new Date(message.timestamp).toLocaleTimeString()}
//             </span>
//           )} */}
//         </div>
//       </div>
//     );
//   }

//   // Prefer normalized final data
//   const techPackData =
//     message.techPack || message.gptResponse?.tech_pack || null;

//   const manufacturingCosts =
//     message.manufacturingCosts ||
//     message.gptResponse?.manufacturing_costs ||
//     null;

//   // 1) Handle question
//   if (message.type === "question" || message.gptResponse?.question) {
//     const questionText = message.gptResponse?.question || message.content || "";
//     return (
//       <div className="flex justify-start mb-4 px-2 sm:px-0">
//         <div className="flex flex-col items-start max-w-[90%] sm:max-w-[75%] lg:max-w-[80%] xl:max-w-[50%]">
//           <div className="text-gray-800 dark:text-white px-0 sm:px-4 py-3 sm:py-4">
//             <p className="text-[13px] sm:text-sm leading-relaxed">
//               {questionText}
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // 2) Handle final (tech pack + costs)
//   if (techPackData && manufacturingCosts) {
//     const currency = manufacturingCosts?.currency || "INR";
//     const imageUrls = normalizeImageUrls(message);

//     return (
//       <div className="flex justify-start mb-5 sm:mb-6 px-2 sm:px-0">
//         <div className="bg-white dark:bg-black rounded-2xl p-4 sm:p-5 w-full max-w-3xl lg:max-w-4xl border border-gray-200 dark:border-[#333333]">
//           <div className="flex items-center mb-4 sm:mb-6">
//             <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-xs sm:text-sm">
//               AI
//             </div>
//             <div className="ml-2 sm:ml-3">
//               <h3 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
//                 Product Analysis Complete
//               </h3>
//             </div>
//           </div>
//           {imageUrls.length > 0 && (
//             <div className="mt-4 sm:mt-6">
//               <h4 className="text-base sm:text-lg font-medium text-gray-800 dark:text-white mb-2.5 sm:mb-3">
//                 Reference Images
//               </h4>

//               {/* Flex wrap + fixed square tiles keeps them medium and 1:1 across widths */}
//               <div className="flex flex-wrap gap-2 sm:gap-3">
//                 {imageUrls.map((url, index) => (
//                   <div
//                     key={index}
//                     className="relative group w-24 sm:w-28 md:w-36 aspect-square"
//                   >
//                     <img
//                       src={url}
//                       alt={`Reference ${index + 1}`}
//                       className="w-full h-full object-cover rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
//                     />
//                     <a
//                       href={url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg text-white text-[11px] sm:text-xs font-medium"
//                     >
//                       Open
//                     </a>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="mb-5 sm:mb-6 mt-5 sm:mt-6">
//             <h4 className="text-base sm:text-lg font-medium text-gray-800 dark:text-white mb-2.5 sm:mb-3">
//               Tech Pack Details
//             </h4>
//             <TechPackList data={techPackData} />
//           </div>

//           <div className="space-y-3 mb-5 sm:mb-6 mt-5 sm:mt-6">
//             <div className="flex items-center justify-between">
//               <h4 className="text-base sm:text-lg font-medium text-gray-800 dark:text-white">
//                 Manufacturing Estimate
//               </h4>
//               <span className="inline-flex items-center h-8 sm:h-9 rounded-full border border-gray-200 bg-gray-50 dark:bg-white px-2 sm:px-2.5 py-0 text-xs sm:text-[13px] text-gray-700 dark:text-black">
//                 Currency: {currency}
//               </span>
//             </div>
//             <div className="p-0">
//               <CostsTable costs={manufacturingCosts} />
//             </div>
//           </div>

//           <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 pt-4">
//             <button
//               onClick={() => setIsContactModalOpen(true)}
//               className="h-11 sm:h-12 inline-flex items-center justify-center bg-[#060A21] dark:bg-white text-white dark:text-black text-sm sm:text-[15px] font-medium px-4 sm:px-5 rounded-full active:scale-[0.99]"
//             >
//               Contact Manufacturer
//             </button>

//             {/* Add the manufacturer purchase option */}
//             <ManufacturerPurchase chatId={message.chatId} />
//           </div>
//         </div>

//         {isContactModalOpen && (
//           <ContactFormModal
//             isOpen={isContactModalOpen}
//             onClose={() => setIsContactModalOpen(false)}
//             userProfile={user}
//             quoteData={{
//               pricing: manufacturingCosts,
//               techPack: techPackData,
//               chatId: message.chatId,
//             }}
//           />
//         )}
//       </div>
//     );
//   }

//   // 3) Fallback for info/legacy text
//   return (
//     <div className="flex justify-start mb-4 px-2 sm:px-0">
//       <div className="flex flex-col items-start max-w-[92%] sm:max-w-[75%] lg:max-w-[80%] xl:max-w-[80%]">
//         <div className="text-gray-800 dark:text-white px-0 sm:px-4 py-3 sm:py-4">
//           <p className="text-[13px] sm:text-sm leading-relaxed">
//             {String(message.content || "")}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

/////////////////////////////////////////////////////////////

import React, { useMemo, useState } from "react";
import ContactFormModal from "../Dashboard/ContactFormModal";
import { useAuth } from "../../context/AuthContext";
import ManufacturerPurchase from "./ManufacturerPurchase";

const normalizeImageUrls = (msg) => {
  const raw =
    msg?.imageUrls ||
    msg?.gptResponse?.imageUrls ||
    msg?.images ||
    msg?.gptResponse?.images ||
    [];
  return Array.isArray(raw) ? raw.filter(Boolean) : [];
};

const formatCurrency = (amount, currency = "INR") => {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n.toLocaleString("en-IN")} ${currency}`;
  }
};

const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700">
    {children}
  </span>
);

function CostsTable({ costs }) {
  const rows = useMemo(() => {
    if (!costs) return [];
    const { currency = "INR", ...tiers } = costs;
    return Object.entries(tiers)
      .filter(([k]) => k !== "currency")
      .map(([qty, price]) => ({
        qty: Number(qty),
        price: Number(price),
        currency,
      }))
      .sort((a, b) => a.qty - b.qty);
  }, [costs]);

  if (!rows.length) return null;
  const currency = costs?.currency || "INR";

  return (
    <div className="space-y-3">
      <div className="hidden md:block overflow-hidden rounded-2xl">
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-sm border border-gray-200 dark:border-[#333333] rounded-2xl bg-white dark:bg-black">
            <thead className="sticky top-0 bg-gray-50 dark:bg-black">
              <tr>
                <th className="text-left py-2.5 px-3 font-semibold text-gray-700 dark:text-gray-200">
                  Quantity
                </th>
                <th className="text-left py-2.5 px-3 font-semibold text-gray-700 dark:text-gray-200">
                  Price / unit
                </th>
                <th className="text-left py-2.5 px-3 font-semibold text-gray-700 dark:text-gray-200">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.qty}
                  className="even:bg-gray-50/50 dark:even:bg-[#151515] border-t border-gray-100 dark:border-[#333333]"
                >
                  <td className="py-2.5 px-3 text-gray-900 dark:text-white">
                    {r.qty.toLocaleString("en-IN")} pcs
                  </td>
                  <td className="py-2.5 px-3 text-gray-800 dark:text-white">
                    {formatCurrency(r.price, currency)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(r.qty * r.price, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:hidden">
        {rows.map((r) => (
          <div
            key={r.qty}
            className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-[#333333] p-3 text-center"
          >
            <div className="text-xs text-gray-500 dark:text-white mb-1">
              {r.qty} pcs
            </div>
            <div className="text-base font-medium text-gray-900 dark:text-white">
              {formatCurrency(r.price, currency)}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-300 mt-0.5">
              Total {formatCurrency(r.qty * r.price, currency)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechPackList({ data }) {
  if (!data) return null;
  const colors = Array.isArray(data.color) ? data.color : [];
  const washes = Array.isArray(data.wash_treatments)
    ? data.wash_treatments
    : [];
  const designs = Array.isArray(data.design)
    ? data.design
    : typeof data.design === "string"
    ? data.design
    : [];

  const renderValue = (val) => {
    if (Array.isArray(val)) {
      if (!val.length)
        return <span className="text-sm text-gray-500 dark:text-white">—</span>;
      return (
        <div className="flex flex-wrap justify-end gap-1.5">
          {val.map((v, i) => (
            <Pill key={i}>{String(v)}</Pill>
          ))}
        </div>
      );
    }
    return (
      <span className="text-sm font-medium text-gray-900 dark:text-white ml-4 text-right">
        {val ?? "—"}
      </span>
    );
  };

  const designValue = Array.isArray(designs)
    ? designs.map((d) => `${d?.placement || "—"} • ${d?.type || "—"}`)
    : designs;

  const rows = [
    { label: "Garment Type", value: data.garment_type },
    { label: "Material", value: data.material },
    { label: "GSM", value: data.gsm },
    { label: "Technology", value: data.tech },
    { label: "Design", value: designValue },
    { label: "Colors", value: colors },
    { label: "Wash Treatments", value: washes },
  ];
  return (
    <div className="divide-y divide-gray-100 dark:divide-[#333333]">
      {rows.map((r) => (
        <div
          key={r.label}
          className="py-2 flex items-start justify-between gap-3"
        >
          <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-200">
            {r.label}
          </span>
          <div className="min-w-0 flex-1 text-right">
            {renderValue(r.value)}
          </div>
        </div>
      ))}

      {data.additional_comments && (
        <div className="py-2 flex items-start justify-between gap-3">
          <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-200">
            Comments
          </span>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed ml-4 text-right">
            {data.additional_comments}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Message({ message, isHistory = false }) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const { user } = useAuth();
  const imageUrls = normalizeImageUrls(message);

  if (message.role === "user") {
    const showUserImages = !isHistory && imageUrls.length > 0;
    return (
      <div className="flex justify-end mb-4 px-2 sm:px-0">
        <div className="flex flex-col items-end max-w-[90%] sm:max-w-[75%] lg:max-w-[60%] xl:max-w-[50%]">
          {showUserImages && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group w-28 sm:w-32 md:w-36 aspect-square"
                >
                  <img
                    src={url}
                    alt={`Uploaded ${idx + 1}`}
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="bg-[#EDEFF1] text-[#060A21] dark:bg-[#333333] dark:text-white text-sm rounded-3xl rounded-br-md px-4 py-3">
            <p className="text-sm">{message.content}</p>
          </div>
          {/* 
          {message.timestamp && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          )} */}
        </div>
      </div>
    );
  }

  // Prefer normalized final data
  const techPackData =
    message.techPack || message.gptResponse?.tech_pack || null;
  const manufacturingCosts =
    message.manufacturingCosts ||
    message.gptResponse?.manufacturing_costs ||
    null;

    const isManufacturerPaid = message?.Payments_For_ManufacturerFind === true || message?.gptResponse?.Payments_For_ManufacturerFind === true;

  // Question or Summary or Generic text => plain bubble
  if (!techPackData || !manufacturingCosts) {
    const text =
      message.gptResponse?.question ||
      message.gptResponse?.summary ||
      message.content ||
      "";
    return (
      <div className="flex justify-start mb-4 px-2 sm:px-0">
        <div className="flex flex-col items-start max-w-[90%] sm:max-w-[75%] lg:max-w-[80%] xl:max-w-[50%]">
          <div className="text-gray-800 dark:text-white px-0 sm:px-4 py-4">
            <p className="text-sm">{text}</p>
          </div>
        </div>
      </div>
    );
  }

  // FINAL: Show your special UI
  const currency = manufacturingCosts?.currency || "INR";

  return (
    <div className="flex justify-start mb-6 px-2 sm:px-0">
      <div className="bg-white dark:bg-black rounded-2xl p-4 sm:p-5 w-full max-w-3xl lg:max-w-4xl border border-gray-200 dark:border-[#333333]">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold">
            AI
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Product Analysis Complete
            </h3>
          </div>
        </div>

        {imageUrls.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
              Reference Images
            </h4>
            <div className="flex flex-wrap gap-3">
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative group w-28 sm:w-32 md:w-36 aspect-square"
                >
                  <img
                    src={url}
                    alt={`Reference ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg shadow-sm"
                  />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg text-white text-xs font-medium"
                  >
                    Open
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 mt-6">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
            Tech Pack Details
          </h4>
          <TechPackList data={techPackData} />
        </div>

        <div className="space-y-3 mb-6 mt-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white">
              Manufacturing Estimate
            </h4>
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 dark:bg-white px-2.5 py-1 text-xs text-gray-700 dark:text-black">
              Currency: {currency}
            </span>
          </div>
          <div className="p-0">
            <CostsTable costs={manufacturingCosts} />
          </div>
        </div>

        <div className="flex justify-center gap-4 flex-col items-center">
          {/* <button
            onClick={() => setIsContactModalOpen(true)}
            className="bg-[#060A21] dark:bg-white text-sm text-white dark:text-black font-medium py-2.5 px-4 rounded-full hover:opacity-95"
          >
            Contact Manufacturer
          </button> */}
          {/* <ManufacturerPurchase chatId={message.chatId} /> */}
          <ManufacturerPurchase chatId={message.chatId} paid={isManufacturerPaid}
          onPaid={() => {
            message.Payments_For_ManufacturerFind = true;
          }}/>
        </div>
      </div>

      {isContactModalOpen && (
        <ContactFormModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          userProfile={user}
          quoteData={{
            pricing: manufacturingCosts,
            techPack: techPackData,
            chatId: message.chatId,
          }}
        />
      )}
    </div>
  );
}
