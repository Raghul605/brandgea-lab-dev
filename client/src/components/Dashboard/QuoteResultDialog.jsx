import React, { useEffect, useRef, useState } from "react";
import { FiX, FiImage, FiPhone, FiMail, FiCopy, FiPlus } from "react-icons/fi";

export default function QuoteResultDialog({
  isOpen,
  handleReset,
  quoteData,
  onContactClick,
  onClose,
}) {
  const dialogRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Reset copied status after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isOpen) return null;

  // ---------- Helpers ----------
  const toArray = (val) => (Array.isArray(val) ? val : val ? [val] : []);

  const humanizeDesign = (val) => {
    const arr = toArray(val);
    if (!arr.length) return "None";
    return arr
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const p = item.placement ? `@${item.placement}` : "";
          const t = item.decoration_type || item.type || "";
          return [t, p].filter(Boolean).join(" ");
        }
        return "";
      })
      .filter(Boolean)
      .join(", ");
  };

  const sortedPricing = () => {
    if (!quoteData?.pricing || typeof quoteData.pricing !== "object") return [];
    const entries = Object.entries(quoteData.pricing).filter(
      ([k, v]) =>
        !isNaN(Number(k)) &&
        v &&
        typeof v === "object" &&
        typeof v.price === "number"
    );
    return entries.sort((a, b) => Number(a[0]) - Number(b[0]));
  };

  const formatCurrency = (value, curr) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: curr || "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const copyTechPackToClipboard = () => {
    if (!quoteData.techPack) return;

    const techPack = quoteData.techPack;
    const techPackText = `
Tech Pack Details:
- Garment Type: ${techPack.garment_type || "—"}
- Material: ${techPack.material || "—"}
- GSM: ${techPack.gsm || "—"}
- Colors: ${toArray(techPack.color).join(", ") || "—"}
- Design: ${humanizeDesign(techPack.Design)}
- Wash Treatments: ${
      toArray(techPack.wash_treatments).length
        ? toArray(techPack.wash_treatments).join(", ")
        : "None"
    }
${
  techPack.additional_comments
    ? `- Additional Comments: ${techPack.additional_comments}`
    : ""
}
    `.trim();

    navigator.clipboard.writeText(techPackText);
    setCopied(true);
  };

  const pricingEntries = sortedPricing();
  const currency =
    (pricingEntries[0]?.[1]?.currency ||
      quoteData?.pricing?.currency ||
      "INR") ??
    "INR";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col animate-scale-in"
      >
        {/* Header - more compact on mobile */}
        <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="max-w-[70%]">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
              Your AI Quotation
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
              Generated based on your requirements
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-gray-700 hover:text-gray-900 font-medium py-1.5 px-2 rounded-lg hover:bg-gray-100 transition"
              title="Create New Quote"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">New</span>
            </button>
            <button
              onClick={onContactClick}
              className="bg-gray-900 text-white font-medium py-1.5 px-3 rounded-lg hover:bg-gray-800 transition shadow-md text-sm"
            >
              Contact
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition"
              aria-label="Close"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="md:hidden">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition"
              aria-label="Close"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        {quoteData && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 mb-4">
              <p className="text-xs sm:text-sm text-yellow-800 flex">
                <svg
                  className="w-3.5 h-3.5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-9a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="leading-tight">
                  * This is an AI-generated estimate. Final pricing may vary based on detailed requirements.
                </span>
              </p>
            </div>

            {/* Enhanced User input echo */}
            {quoteData.sanitizedInput && (
              <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3">
                <div className="pl-2">
                  <div className="flex items-center mb-1.5">
                    <span className="text-gray-700 font-semibold text-sm">
                      Your Request
                    </span>
                  </div>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed italic">
                    "{quoteData.sanitizedInput.length > 120 ? 
                      `${quoteData.sanitizedInput.substring(0, 120)}...` : 
                      quoteData.sanitizedInput}"
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              {/* Main content */}
              <div className="flex-1 min-w-0">
                {/* Tech Pack */}
                {quoteData.techPack && (
                  <section className="mb-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm relative">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-base sm:text-lg text-gray-900 flex items-center">
                        <span className="w-1.5 h-4 sm:w-2 sm:h-5 bg-blue-500 rounded-full mr-2"></span>
                        Tech Pack Details
                      </h4>
                      <button
                        onClick={copyTechPackToClipboard}
                        className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition"
                        title="Copy Tech Pack"
                      >
                        {copied ? (
                          <span className="text-green-500 text-xs sm:text-sm">Copied!</span>
                        ) : (
                          <>
                            <FiCopy className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5" />
                            <span className="text-xs hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DetailItem
                        label="Garment Type"
                        value={quoteData.techPack.garment_type}
                      />
                      <DetailItem
                        label="Material"
                        value={quoteData.techPack.material}
                      />
                      <DetailItem label="GSM" value={quoteData.techPack.gsm} />
                      <DetailItem
                        label="Colors"
                        value={
                          toArray(quoteData.techPack.color).join(", ") || "—"
                        }
                      />
                      <DetailItem
                        label="Design"
                        value={humanizeDesign(quoteData.techPack.Design)}
                      />
                      <DetailItem
                        label="Wash Treatments"
                        value={
                          toArray(quoteData.techPack.wash_treatments).length
                            ? toArray(quoteData.techPack.wash_treatments).join(
                                ", "
                              )
                            : "None"
                        }
                      />
                    </div>

                    {quoteData.techPack.additional_comments && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <h5 className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                          Additional Comments
                        </h5>
                        <p className="text-gray-900 text-sm leading-relaxed">
                          {quoteData.techPack.additional_comments}
                        </p>
                      </div>
                    )}
                  </section>
                )}

                {/* Pricing */}
                <section className="mb-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-base sm:text-lg text-gray-900 flex items-center">
                      <span className="w-1.5 h-4 sm:w-2 sm:h-5 bg-green-500 rounded-full mr-2"></span>
                      Pricing
                    </h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Prices in {currency}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left py-2 px-2 sm:px-3 font-medium text-gray-700">
                            Quantity
                          </th>
                          <th className="text-left py-2 px-2 sm:px-3 font-medium text-gray-700">
                            Unit Price
                          </th>
                          <th className="text-left py-2 px-2 sm:px-3 font-medium text-gray-700">
                            Total Price
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricingEntries.length > 0 ? (
                          pricingEntries.map(([qty, info], i) => (
                            <tr
                              key={qty}
                              className={
                                i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                              }
                            >
                              <td className="py-2 px-2 sm:px-3 font-medium text-gray-900">
                                {qty} pcs
                              </td>
                              <td className="py-2 px-2 sm:px-3 text-gray-900">
                                {formatCurrency(info.price, currency)}
                              </td>
                              <td className="py-2 px-2 sm:px-3 font-semibold text-gray-900">
                                {formatCurrency(
                                  Number(info.price) * Number(qty),
                                  currency
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              className="py-3 px-3 text-gray-500 text-center text-xs"
                              colSpan={3}
                            >
                              No pricing information available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {pricingEntries.length > 0 && (
                    <div className="mt-3 text-xs text-gray-500">
                      * Prices include material and basic manufacturing costs.
                      Additional charges may apply for special requirements.
                    </div>
                  )}
                </section>
              </div>

              {/* Sidebar with images and actions */}
              <div className="lg:w-72 flex-shrink-0">
                {/* Images */}
                {quoteData.imageUrls?.length > 0 && (
                  <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold mb-2 text-gray-800 flex items-center text-sm sm:text-base">
                      <FiImage className="mr-1.5 w-3.5 h-3.5" />
                      Reference Images
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {quoteData.imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Reference ${index + 1}`}
                            className="w-full h-28 object-cover rounded-lg border border-gray-200"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional info/actions card */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                  <h5 className="font-medium text-blue-800 mb-1.5 text-sm">Next Steps</h5>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                    <li>Discuss manufacturing timeline</li>
                    <li>Request samples</li>
                    <li>Customize your order</li>
                    <li>Finalize design details</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-center">
                  <h5 className="text-sm font-semibold text-gray-900">
                    Need assistance?
                  </h5>
                  <p className="text-xs text-gray-600 mt-1">
                    Our team is here to help.
                  </p>

                  {/* Stacked vertically */}
                  <div className="mt-2 flex flex-col items-center justify-center gap-1.5">
                    <a
                      href="mailto:connect@brandgea.com"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-800 hover:text-gray-900 hover:underline"
                      aria-label="Email connect at brandgea dot com"
                    >
                      <FiMail className="h-3.5 w-3.5" />
                      connect@brandgea.com
                    </a>

                    <a
                      href="tel:+918148939892"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-800 hover:text-gray-900 hover:underline"
                      aria-label="Call +91 81489 39892"
                    >
                      <FiPhone className="h-3.5 w-3.5" />
                      +91 81489 39892
                    </a>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Typically replies within 24 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile buttons at bottom */}
            <div className="md:hidden sticky bottom-0 bg-white border-t border-gray-200 p-3 -mx-3 -mb-3 mt-4">
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-1.5 text-gray-700 border border-gray-300 font-medium py-2 rounded-lg transition text-sm"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  New Quote
                </button>
                <button
                  onClick={onContactClick}
                  className="flex-1 bg-gray-900 text-white font-medium py-2 rounded-lg transition shadow-md text-sm"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for detail items
function DetailItem({ label, value }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="font-medium text-gray-900 text-sm">{value || "—"}</div>
    </div>
  );
}