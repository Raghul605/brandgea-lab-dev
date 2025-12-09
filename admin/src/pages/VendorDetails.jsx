// src/pages/admin/VendorDetails.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL;

export default function VendorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [navigatingLeadId, setNavigatingLeadId] = useState(null);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setError("");
        setLoading(true);
        const res = await axios.get(
          `${BASE}/api/automation/vendor-management/vendors/${id}`
        );
        setVendor(res.data);
      } catch (err) {
        console.error("Error fetching vendor:", err);
        const msg =
          err?.response?.data?.message || "Failed to load vendor details.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVendor();
    } else {
      setLoading(false);
      setError("Missing vendor id in URL.");
    }
  }, [id]);

  const handleTxnRowClick = async (leadCode) => {
    if (!leadCode) return;
    try {
      setNavigatingLeadId(leadCode);

      // Use getAllLeads filter by LeadID to find the Mongo _id
      const res = await axios.get(
        `${BASE}/api/automation/lead-management/leads`,
        {
          params: { LeadID: leadCode },
        }
      );

      const list = Array.isArray(res.data) ? res.data : [];
      if (list.length > 0 && list[0]._id) {
        navigate(`/dashboard/leads/${list[0]._id}`);
      } else {
        console.warn("No lead found for LeadID:", leadCode);
      }
    } catch (err) {
      console.error("Failed to navigate to lead from vendor transaction:", err);
    } finally {
      setNavigatingLeadId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-4 min-h-[80vh] flex flex-col items-center justify-center">
        <p className="text-sm text-gray-600 mb-3">
          Vendor not found or deleted.
        </p>
        <button
          onClick={() => navigate("/dashboard/vendors")}
          className="px-4 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-900"
        >
          Back to vendors
        </button>
      </div>
    );
  }

  const status = vendor.status || "pending";

  return (
    <div className="p-4 sm:p-6" style={{ minHeight: "80vh" }}>
      <div className="max-w-4xl mx-auto space-y-4">
        <button
          className="text-xs text-gray-600 hover:text-black mb-1"
          onClick={() => navigate("/dashboard/vendors")}
        >
          ← Back to vendors
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {vendor.VendorName || "Vendor Details"}
            </h1>
            <p className="text-xs text-gray-500 mt-1">{vendor.VendorEmail}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold border ${
              status === "active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : status === "inactive"
                ? "bg-gray-50 text-gray-700 border-gray-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[11px] uppercase text-gray-500">
                Vendor Name
              </div>
              <div className="text-gray-900 font-medium">
                {vendor.VendorName || "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-gray-500">
                Phone
              </div>
              <div className="text-gray-900">
                {vendor.VendorPhone || "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-gray-500">
                Email
              </div>
              <div className="text-gray-900">
                {vendor.VendorEmail || "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-gray-500">
                Status
              </div>
              <div className="text-gray-900 capitalize">{status}</div>
            </div>
          </div>

          {vendor.createdAt && (
            <div className="text-[11px] text-gray-500 mt-2">
              Created:{" "}
              {new Date(vendor.createdAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          )}
        </div>

        {/* Transaction history (if present) */}
        {vendor.transactionHistory && vendor.transactionHistory.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-semibold text-gray-900">
                Lead Transactions
              </div>
              <div className="text-[11px] text-gray-500">
                {vendor.transactionHistory.length} record
                {vendor.transactionHistory.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr className="text-left text-[10px] uppercase tracking-wide text-gray-500">
                    <th className="px-2 py-1.5">Lead ID</th>
                    <th className="px-2 py-1.5">Quoted</th>
                    <th className="px-2 py-1.5">Paid</th>
                    <th className="px-2 py-1.5">Status</th>
                    <th className="px-2 py-1.5">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {vendor.transactionHistory.map((t, idx) => {
                    const leadCode = t.LeadID;
                    const quoted =
                      typeof t.amountQuoted === "number"
                        ? t.amountQuoted
                        : typeof t.amount === "number"
                        ? t.amount
                        : null;
                    const paid =
                      typeof t.amountPaid === "number"
                        ? t.amountPaid
                        : null;

                    const dateSource =
                      t.Timestamp || t.transactionDate || t.createdAt;
                    const dateLabel = dateSource
                      ? new Date(dateSource).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—";

                    const isNavigating = navigatingLeadId === leadCode;

                    return (
                      <tr
                        key={idx}
                        onClick={() => handleTxnRowClick(leadCode)}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <td className="px-2 py-1.5 text-[11px] text-gray-900 font-mono">
                          {leadCode || "—"}
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
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                            {t.status || "—"}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-[10px] text-gray-500">
                          {isNavigating ? "Opening…" : dateLabel}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
