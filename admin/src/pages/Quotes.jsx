import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Table from "../components/Table";
import "./Quotes.css";

export default function Quotes() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(Number(params.get("page")) || 1);
  const [sort, setSort] = useState(params.get("sort") || "desc");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/admin/clothing/quote-garments-chat-user?page=${page}&sort=${sort}`,
        { withCredentials: true }
      );
      setData(res.data.results || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to fetch quotes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setParams({ page, sort }, { replace: true });
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort]);

  // ✅ Delete quote handler
  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this quote?")) return;

    try {
      await axios.delete(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/admin/clothing/quote/${productId}`,
        { withCredentials: true }
      );
      alert("Quote deleted successfully");
      fetchData(); // refresh table
    } catch (err) {
      console.error("Failed to delete quote:", err);
      alert(err?.response?.data?.error || "Failed to delete quote");
    }
  };

  const columns = [
    {
      header: "Quote Number",
      accessor: (row) => row.quoteNumber,
      key: "quoteNumber",
    },
    {
      header: "Heading",
      accessor: (row) => row.heading,
      key: "heading",
    },
    {
      header: "Date",
      accessor: (row) => {
        if (!row.createdAt) return "-";
        return new Date(row.createdAt).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
      key: "createdAt",
    },
    {
      header: "User",
      accessor: (row) => row.user?.name || "-",
      key: "user",
    },
    {
      header: "Email",
      accessor: (row) => row.user?.email || "-",
      key: "email",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <button
          className="btn-delete"
          onClick={(e) => {
            e.stopPropagation(); // prevent navigating to quote details
            handleDelete(row._id);
          }}
        >
          Delete
        </button>
      ),
      key: "actions",
    },
  ];

  const onRowClick = (row) => {
    navigate(`/dashboard/quotes/${row._id}`);
  };

  return (
    <div className="card">
      <div className="card__header">
        <h3>Quotes</h3>
        <div className="row-actions">
          <label className="field field--inline">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </label>
        </div>
      </div>

      {err && <div className="alert">{err}</div>}
      {loading ? (
        <div className="loader">Loading…</div>
      ) : (
        <>
          <Table columns={columns} data={data} onRowClick={onRowClick} />
          <div className="pagination">
            <button
              className="btn btn--ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <div className="pagination__pages">
              Page {page} of {totalPages}
            </div>
            <button
              className="btn btn--ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
