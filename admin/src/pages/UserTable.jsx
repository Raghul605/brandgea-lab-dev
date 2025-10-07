import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Table from "../components/Table";
// import "./UserTable.css";

export default function Users() {
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
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/clothing/all-users?page=${page}&direction=${sort}`,
        { withCredentials: true }
      );
      setData(res.data.results || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      console.error("Error fetching users:", e);
      setErr(e?.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setParams({ page, sort }, { replace: true });
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort]);

  const columns = [
    { header: "Name", accessor: (row) => row.name || "-", key: "name" },
    { header: "Email", accessor: (row) => row.email || "-", key: "email" },
    { header: "Country", accessor: (row) => row.country || "-", key: "country" },
    { header: "Chat Count", accessor: (row) => row.chatCount ?? 0, key: "chatCount" },
    {
      header: "Created At",
      accessor: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleString()
          : "-",
      key: "createdAt",
    },
  ];

  const onRowClick = (row) => {
    // Navigate to user details page using the hidden _id
    navigate(`/dashboard/users/${row._id}`);
  };

  return (
    <div className="card">
      <div className="card__header">
        <h3>Users</h3>
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
