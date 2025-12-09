// src/pages/admin/LeadDetails.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL;
const PUBLIC_LEAD_BASE_URL = "https://lab.brandgea.com/lead";

export default function LeadDetails() {
  const { id } = useParams(); // Mongo _id
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [shareUrl, setShareUrl] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy link");

  const [vendorNavEmail, setVendorNavEmail] = useState("");

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setError("");
        setLoading(true);
        const res = await axios.get(
          `${BASE}/api/automation/lead-management/leads/${id}`
        );
        const fullLead = res.data;
        setLead(fullLead);

        if (fullLead.LeadID) {
          setShareUrl(`${PUBLIC_LEAD_BASE_URL}/${fullLead.LeadID}`);
        }
      } catch (err) {
        console.error("Error fetching lead:", err);
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load lead details.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLead();
    } else {
      setLoading(false);
      setError("Missing lead id in URL.");
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

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy link"), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
      setCopyLabel("Copy failed");
      setTimeout(() => setCopyLabel("Copy link"), 1500);
    }
  };

  const handleVendorRowClick = async (vendorEmail) => {
    if (!vendorEmail) return;
    try {
      setVendorNavEmail(vendorEmail);
      // Find vendor by email, then navigate by _id
      const res = await axios.get(
        `${BASE}/api/automation/vendor-management/vendors`,
        {
          params: { VendorEmail: vendorEmail },
        }
      );
      const list = Array.isArray(res.data) ? res.data : [];
      if (list.length > 0 && list[0]._id) {
        navigate(`/dashboard/vendors/${list[0]._id}`);
      } else {
        console.warn("No vendor found for email:", vendorEmail);
      }
    } catch (err) {
      console.error("Failed to navigate to vendor:", err);
    } finally {
      setVendorNavEmail("");
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
          Lead not found or deleted.
        </p>
        <button
          onClick={() => navigate("/dashboard/leads")}
          className="px-4 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-900"
        >
          Back to leads
        </button>
      </div>
    );
  }

  const slotsAvailable =
    typeof lead.max_number_of_allowed_quotes === "number"
      ? lead.max_number_of_allowed_quotes -
        (lead.number_of_recieved_quotes || 0)
      : null;

  const slotsLabel =
    typeof slotsAvailable === "number"
      ? slotsAvailable > 0
        ? `${slotsAvailable} slots available`
        : "No slots available"
      : null;

  const quantity = lead.Quantity ?? null;
  const targetCostNumber =
    typeof lead.TargetCost === "number" ? lead.TargetCost : null;

  const targetTATLabel = lead.TargetTAT
    ? new Date(lead.TargetTAT).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="p-4 sm:p-6" style={{ minHeight: "80vh" }}>
      <div className="max-w-4xl mx-auto space-y-4">
        <button
          className="text-xs text-gray-600 hover:text-black mb-1"
          onClick={() => navigate("/dashboard/leads")}
        >
          ← Back to leads
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Lead Details
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              LeadID:{" "}
              <span className="font-mono font-semibold">
                {lead.LeadID || "—"}
              </span>
            </p>
          </div>
          {slotsLabel && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold border ${
                slotsAvailable > 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  slotsAvailable > 0 ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              {slotsLabel}
            </span>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Customer + basic info */}
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
              Created:{" "}
              {lead.createdAt
                ? new Date(lead.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "—"}
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
              Requirement
            </div>
            <pre className="text-xs text-gray-800 whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
              {requirementSummary()}
            </pre>
          </div>

          {/* Target summary – only show if we have at least one value */}
          {(quantity || targetCostNumber || targetTATLabel) && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {quantity && (
                <div className="border border-gray-100 rounded-lg px-3 py-2 bg-gray-50">
                  <div className="text-[10px] uppercase text-gray-500">
                    Total Quantity
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {quantity} pcs
                  </div>
                </div>
              )}
              {targetCostNumber && (
                <div className="border border-gray-100 rounded-lg px-3 py-2 bg-gray-50">
                  <div className="text-[10px] uppercase text-gray-500">
                    Target Cost
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    ₹{targetCostNumber.toLocaleString("en-IN")}
                  </div>
                </div>
              )}
              {targetTATLabel && (
                <div className="border border-gray-100 rounded-lg px-3 py-2 bg-gray-50">
                  <div className="text-[10px] uppercase text-gray-500">
                    Target TAT
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {targetTATLabel}
                  </div>
                </div>
              )}
            </div>
          )}

          {lead.referenceimages?.length > 0 && (
            <div className="mt-2">
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

        {/* Shareable link */}
        {shareUrl && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 space-y-2">
            <div className="text-sm font-semibold text-emerald-800">
              Lead share link
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-mono text-emerald-900"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 rounded-lg bg-emerald-700 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-800"
              >
                {copyLabel}
              </button>
            </div>
          </div>
        )}

        {/* Vendors who bought this lead */}
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">
              Vendors who bought this lead
            </div>
            <div className="text-[11px] text-gray-500">
              {lead.vendor_quotes?.length || 0} vendor
              {lead.vendor_quotes?.length === 1 ? "" : "s"}
            </div>
          </div>

          {(!lead.vendor_quotes || lead.vendor_quotes.length === 0) && (
            <p className="text-xs text-gray-500">
              No vendors have purchased this lead yet.
            </p>
          )}

          {lead.vendor_quotes && lead.vendor_quotes.length > 0 && (
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr className="text-left text-[10px] uppercase tracking-wide text-gray-500">
                    <th className="px-2 py-1.5">Vendor</th>
                    <th className="px-2 py-1.5">Quoted</th>
                    <th className="px-2 py-1.5">Paid</th>
                    <th className="px-2 py-1.5">Status</th>
                    <th className="px-2 py-1.5">Expiry</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {lead.vendor_quotes.map((vq, idx) => {
                    const quoted =
                      typeof vq.amountQuoted === "number"
                        ? vq.amountQuoted
                        : null;
                    const paid =
                      typeof vq.amountPaid === "number"
                        ? vq.amountPaid
                        : null;

                    const isNav = vendorNavEmail === vq.VendorEmail;

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          handleVendorRowClick(vq.VendorEmail)
                        }
                      >
                        <td className="px-2 py-1.5">
                          <div className="text-[11px] text-gray-900">
                            {vq.VendorEmail}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {vq.paymentId}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-[11px] text-gray-800">
                          {quoted != null
                            ? `₹${quoted.toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                        <td className="px-2 py-1.5 text-[11px] text-gray-800">
                          {paid != null
                            ? `₹${paid.toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                        <td className="px-2 py-1.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              vq.Status === "succeeded"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {vq.Status === "succeeded"
                              ? "Succeeded"
                              : "Pre-confirmation"}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-[10px] text-gray-500">
                          {isNav
                            ? "Opening vendor…"
                            : vq.expiryTime
                            ? new Date(
                                vq.expiryTime
                              ).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
