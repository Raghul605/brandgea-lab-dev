import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import api from "../api/axios";
import Table from "../components/Table";
import axios from "axios";

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const fetchOrders = async (p = 1) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/admin/orders?page=${p}&limit=${limit}`,
        { withCredentials: true }
      );
      const data = res.data || {};

      const list = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];
      setOrders(list);

      if (typeof data.page === "number") setPage(data.page);
      if (typeof data.totalPages === "number") setTotalPages(data.totalPages);
    } catch (err) {
      console.error("fetchOrders:", err);
      setError("Failed to load orders. Please try again later.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId, e) => {
    // Prevent row click when clicking delete
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${orderId}`,
        { withCredentials: true }
      );
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      alert("Order deleted successfully!");
    } catch (err) {
      console.error("Failed to delete order:", err);
      alert(err?.response?.data?.error || "Failed to delete order");
    }
  };

  // const columns = [
  //   {
  //     key: "product",
  //     header: "Product",
  //     accessor: (r) => r.product ?? r.productName ?? "—",
  //   },
  //   {
  //     key: "status",
  //     header: "Status",
  //     accessor: (r) => r.status?.currentStatus ?? r.status ?? "—",
  //   },
  //   {
  //     key: "client",
  //     header: "Client",
  //     accessor: (r) =>
  //       r.client?.name
  //         ? `${r.client.name}${r.client.email ? ` (${r.client.email})` : ""}`
  //         : r.client?.email ?? "—",
  //   },
  //   {
  //     key: "qty",
  //     header: "Qty",
  //     accessor: (r) => (typeof r.quantity !== "undefined" ? r.quantity : "—"),
  //   },
  //   {
  //     key: "created",
  //     header: "Created",
  //     accessor: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"),
  //   },
  //   {
  //     key: "actions",
  //     header: "Actions",
  //     accessor: (r) => (
  //       <div style={{ textAlign: "center" }}>
  //         <button
  //           onClick={(e) => handleDelete(r._id, e)}
  //           style={{
  //             backgroundColor: "#f56565",
  //             color: "#fff",
  //             border: "none",
  //             padding: "4px 8px",
  //             borderRadius: 4,
  //             cursor: "pointer",
  //           }}
  //         >
  //           Delete
  //         </button>
  //       </div>
  //     ),
  //   },
  // ];

  const columns = [
    {
      key: "product",
      header: "Product",

      accessor: (r) => r.product?.productName || "—",
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) => r.status?.currentStatus || "—",
    },
    {
      key: "client",
      header: "Client",
      accessor: (r) =>
        r.client?.name
          ? `${r.client.name}${r.client.email ? ` (${r.client.email})` : ""}`
          : r.client?.email || "—",
    },
    {
      key: "qty",
      header: "Qty",

      accessor: (r) => r.product?.totalQuantity ?? "—",
    },
    {
      key: "created",
      header: "Created",
      accessor: (r) =>
        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—",
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (r) => (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={(e) => handleDelete(r._id, e)}
            style={{
              backgroundColor: "#f56565",
              color: "#fff",
              border: "none",
              padding: "4px 8px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Row click handler
  const handleRowClick = (order) => {
    navigate(`/dashboard/orders/${order._id}`);
  };

  if (loading) return <div className="p-4">Loading orders...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4" style={{ minHeight: "80vh" }}>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      {/* Table container */}
      <div style={{ overflowX: "auto" }}>
        <Table
          columns={columns}
          data={orders}
          onRowClick={handleRowClick} // pass row click handler
        />
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginTop: 16,
        }}
      >
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          style={{ padding: "4px 12px", borderRadius: 4 }}
        >
          Prev
        </button>

        <div style={{ alignSelf: "center" }}>
          Page {page} {totalPages ? `of ${totalPages}` : ""}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages || p + 1, p + 1))}
          disabled={totalPages && page >= totalPages}
          style={{ padding: "4px 12px", borderRadius: 4 }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
