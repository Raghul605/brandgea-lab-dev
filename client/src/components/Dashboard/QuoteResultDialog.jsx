import React, { useEffect, useRef, useState } from "react";
import { FiX, FiImage, FiPhone, FiMail, FiCopy } from "react-icons/fi";

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
- Wash Treatments: ${toArray(techPack.wash_treatments).length
  ? toArray(techPack.wash_treatments).join(", ")
  : "None"}
${techPack.additional_comments ? `- Additional Comments: ${techPack.additional_comments}` : ""}
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-scale-in"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              Your AI Quotation
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Generated based on your requirements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyTechPackToClipboard}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition"
              title="Copy Tech Pack"
            >
              {copied ? (
                <span className="text-green-500 text-sm">Copied!</span>
              ) : (
                <FiCopy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {quoteData && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {/* Enhanced User input echo */}
            {quoteData.sanitizedInput && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-white p-3">
                <div className="pl-4">
                  <div className="flex items-center mb-2">
                    <span className="text-gray-700 font-semibold">
                      Your Request
                    </span>
                    <span className="mx-2 text-gray-400 ">•</span>
                    <span className="text-xs text-gray-600">AI Analysis</span>
                  </div>
                  <p className="text-gray-800 text-base leading-relaxed italic">
                    "{quoteData.sanitizedInput}"
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main content */}
              <div className="flex-1 min-w-0">
                {/* Tech Pack */}
                {quoteData.techPack && (
                  <section className="mb-6 p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-semibold mb-4 text-lg text-gray-900 flex items-center">
                      <span className="w-2 h-5 bg-blue-500 rounded-full mr-2"></span>
                      Tech Pack Details
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div className="mt-5 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Additional Comments
                        </h5>
                        <p className="text-gray-900 leading-relaxed">
                          {quoteData.techPack.additional_comments}
                        </p>
                      </div>
                    )}
                  </section>
                )}

                {/* Pricing */}
                <section className="mb-6 p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg text-gray-900 flex items-center">
                      <span className="w-2 h-5 bg-green-500 rounded-full mr-2"></span>
                      Pricing
                    </h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Prices in {currency}
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">
                            Quantity
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">
                            Unit Price
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">
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
                              <td className="py-3 px-4 font-medium text-gray-900">
                                {qty} pcs
                              </td>
                              <td className="py-3 px-4 text-gray-900">
                                {formatCurrency(info.price, currency)}
                              </td>
                              <td className="py-3 px-4 font-semibold text-gray-900">
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
                              className="py-4 px-4 text-gray-500 text-center"
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
                    <div className="mt-4 text-xs text-gray-500">
                      * Prices include material and basic manufacturing costs.
                      Additional charges may apply for special requirements.
                    </div>
                  )}
                </section>
              </div>

              {/* Sidebar with images and actions */}
              <div className="lg:w-80 flex-shrink-0">
                {/* Images */}
                {quoteData.imageUrls?.length > 0 && (
                  <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-gray-800 flex items-center">
                      <FiImage className="mr-2" />
                      Reference Images
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {quoteData.imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Reference ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional info/actions card */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                  <h5 className="font-medium text-blue-800 mb-2">Next Steps</h5>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                    <li>Discuss manufacturing timeline</li>
                    <li>Request samples</li>
                    <li>Customize your order</li>
                    <li>Finalize design details</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-center">
                  <h5 className="text-base font-semibold text-gray-900">
                    Need assistance?
                  </h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Our team is here to help.
                  </p>

                  {/* Stacked vertically */}
                  <div className="mt-3 flex flex-col items-center justify-center gap-2">
                    <a
                      href="mailto:connect@brandgea.com"
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-900 hover:underline"
                      aria-label="Email connect at brandgea dot com"
                    >
                      <FiMail className="h-4 w-4" />
                      connect@brandgea.com
                    </a>

                    <a
                      href="tel:+918148939892"
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-900 hover:underline"
                      aria-label="Call +91 81489 39892"
                    >
                      <FiPhone className="h-4 w-4" />
                      +91&nbsp;81489&nbsp;39892
                    </a>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    Typically replies within 24 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 flex">
                  <svg
                    className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-9a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    * This is an AI-generated estimate. Final pricing may vary
                    based on detailed requirements.
                    {pricingEntries.length > 0 &&
                      " If you have a better quote, we can match or beat it."}
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-white text-gray-800 hover:bg-gray-50 border border-gray-300 font-medium py-3 px-6 rounded-lg transition flex items-center justify-center"
                >
                  Create New Quote
                </button>
                <button
                  onClick={onContactClick}
                  className="flex-1 text-white font-semibold py-3 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition shadow-md hover:shadow-lg"
                >
                  Contact for Manufacturing
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
    <div className="space-y-1">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="font-medium text-gray-900">{value || "—"}</div>
    </div>
  );
}