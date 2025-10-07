import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function TrackOrder() {
  const { trackingToken } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/track/${trackingToken}`,
          { withCredentials: true }
        );
        setOrder(res.data);
      } catch (err) {
        console.error("fetchTrackOrder:", err);
        setError("Invalid tracking link or order not found");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [trackingToken]);

  if (loading) return <div className="p-4">Loading order details...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!order) return <div className="p-4">Order not found</div>;

  return (
    <div className="p-4 text-black">
      <h2 className="text-2xl font-bold mb-4">Order Tracking</h2>

      {/* Client shared file at the top */}
      {order.files?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-2">Client Shared File</h3>
          <div className="flex gap-2 flex-wrap">
            {order.files.map((f, i) => (
              <div key={i} className="border p-2 rounded">
                <a
                  href={f}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  file-{i}
                </a>
                <img src={f} alt={`file-${i}`} className="max-w-xs mt-2 rounded border" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order details */}
      <p><strong>Product:</strong> {order.product ?? "—"}</p>
      <p><strong>Quantity:</strong> {order.quantity ?? "—"}</p>
      <p><strong>Delivery Location:</strong> {order.deliveryLocation ?? "—"}</p>
      <p><strong>Current Status:</strong> {order.status?.currentStatus ?? "—"}</p>

      {/* Status history */}
      <h3 className="mt-4 font-bold">Status History</h3>
      {order.status?.statusHistory?.length > 0 ? (
        <ul className="list-disc pl-5">
          {order.status.statusHistory.map((s, i) => (
            <li key={i} className="mb-3">
              <strong>{s.status}</strong> {s.notes && `- ${s.notes}`} <br />
              <small>{s.updatedAt ? new Date(s.updatedAt).toLocaleString() : "-"}</small>

              {/* Status images */}
              {s.images?.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {s.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`status-${i}-img-${idx}`}
                      className="max-w-xs rounded border"
                    />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No status updates yet</p>
      )}
    </div>
  );
}
