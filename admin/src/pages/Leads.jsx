// src/pages/admin/Leads.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL;
const PAGE_SIZE = 10;

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setError("");
        setLoading(true);
        const res = await axios.get(
          `${BASE}/api/automation/lead-management/leads`
        );
        setLeads(res.data || []);
      } catch (err) {
        console.error("Error fetching leads:", err);
        const msg =
          err?.response?.data?.message || "Failed to load leads. Please retry.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter((lead) => {
      const id = (lead.LeadID || "").toLowerCase();
      const title = (lead.leadTitle || "").toLowerCase();
      const name = (lead.CustomerName || "").toLowerCase();
      const email = (lead.CustomerEmail || "").toLowerCase();
      const mobile = (lead.CustomerMobile || "").toLowerCase();
      return (
        id.includes(term) ||
        title.includes(term) ||
        name.includes(term) ||
        email.includes(term) ||
        mobile.includes(term)
      );
    });
  }, [leads, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );
  const pageSafe = Math.min(page, totalPages);
  const startIdx = (pageSafe - 1) * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;
  const paginated = filtered.slice(startIdx, endIdx);

  if (loading) {
    return (
      <div className="p-4 min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6" style={{ minHeight: "80vh" }}>
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Leads
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-gray-700">
                {leads.length} total
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search LeadID / customer / mobile"
                className="w-52 sm:w-64 rounded-full border border-gray-200 pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
              <span className="absolute right-2 top-1.5 text-[10px] text-gray-400">
                ⌕
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {paginated.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            No leads match this search.
          </div>
        ) : (
          <div className="mt-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-2.5">Lead ID</th>
                  <th className="px-4 py-2.5">Title</th>
                  <th className="px-4 py-2.5 hidden sm:table-cell">
                    Customer
                  </th>
                  <th className="px-4 py-2.5 hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-4 py-2.5 hidden md:table-cell">
                    Created
                  </th>
                  <th className="px-4 py-2.5 text-right">Quotes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((lead) => (
                  <tr
                    key={lead._id}
                    className="cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => navigate(`/dashboard/leads/${lead._id}`)}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-800">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 text-white px-2 py-0.5 text-[10px]">
                        {lead.LeadID || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-900 text-sm max-w-xs truncate">
                      {lead.leadTitle}
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell text-xs text-gray-700">
                      <div>{lead.CustomerName || "—"}</div>
                      {lead.CustomerMobile && (
                        <div className="text-[11px] text-gray-500">
                          {lead.CustomerMobile}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-xs text-gray-600 max-w-[200px] truncate">
                      {lead.CustomerEmail}
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-xs text-gray-500 whitespace-nowrap">
                      {lead.createdAt
                        ? new Date(lead.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right text-[11px] text-gray-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>
                          {typeof lead.number_of_recieved_quotes === "number"
                            ? lead.number_of_recieved_quotes
                            : 0}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
              <p className="text-[11px] text-gray-400">
                Showing {paginated.length} of {filtered.length} lead(s).
              </p>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  disabled={pageSafe <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 rounded-full border border-gray-200 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-gray-500">
                  Page {pageSafe} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={pageSafe >= totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="px-2 py-1 rounded-full border border-gray-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
