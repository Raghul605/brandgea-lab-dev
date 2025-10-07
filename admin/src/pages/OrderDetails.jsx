import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import axios from "axios";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Status update state
  const [newStatus, setNewStatus] = useState("Order Created");
  const [newStatusNote, setNewStatusNote] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`,
        { withCredentials: true }
      );
      setOrder(res.data);
      if (res.data?.status?.currentStatus) {
        setNewStatus(res.data.status.currentStatus);
      }
    } catch (err) {
      console.error("fetchOrder:", err);
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleShareStatus = async () => {
    if (!order) return;
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/admin/orders/${id}/generate-tracking-link`,
        { withCredentials: true }
      );
      const trackingLink = res.data.trackingLink;

      await navigator.clipboard.writeText(trackingLink); // copy to clipboard
      setCopied(true);

      setTimeout(() => setCopied(false), 2000); // reset after 2 sec
      alert(`Tracking link copied to clipboard!\n\n${trackingLink}`);
    } catch (err) {
      console.error("Failed to generate tracking link:", err);
      alert("Failed to generate tracking link");
    }
  };

  // Resize image before upload
  const resizeImage = (file, maxWidth = 800, maxHeight = 800) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: file.type }));
          },
          file.type,
          0.8
        );
      };
    });
  };

  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files);
    const resizedFiles = await Promise.all(files.map((f) => resizeImage(f)));
    setSelectedFiles(resizedFiles);
  };

  const handleAddStatus = async () => {
    if (!newStatus.trim() || !order) return;

    try {
      setAdding(true);
      const formData = new FormData();
      formData.append("status", newStatus);
      formData.append("notes", newStatusNote);
      formData.append("updatedBy", "Admin");

      selectedFiles.forEach((file) => formData.append("images", file));

      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}/status`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setOrder(res.data);
      setNewStatusNote("");
      setSelectedFiles([]);
    } catch (err) {
      console.error("add status:", err);
      alert("Failed to update status");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="p-4">Loading order details...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!order) return <div className="p-4">Order not found</div>;

  const statusHistory = order.status?.statusHistory ?? [];

  return (
    <div className="p-4 text-white">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
      >
        ← Back
      </button>

      {/* <h2 className="text-2xl font-bold mb-2">{order.product ?? "Order"}</h2> */}
      <h2 className="text-2xl font-bold mb-2">
        {order.product?.productName || order.product?.garmentType || "Order"}
      </h2>

      <div className="flex gap-6">
        <div>
          {/* <img
            src={order.files?.[0] ?? "https://via.placeholder.com/150"}
            alt={order.product}
            className="w-40 h-40 object-cover rounded"
          /> */}

          <img
            src={order.files?.[0] ?? "https://via.placeholder.com/150"}
            alt={
              order.product?.productName ||
              order.product?.garmentType ||
              "Product"
            }
            className="w-40 h-40 object-cover rounded"
          />
        </div>

        <div className="space-y-1 text-black">
          <p>
            <strong>Client:</strong>{" "}
            {order.client?.name || order.client?.email || "—"}
          </p>
          <p>
            <strong>Email:</strong> {order.client?.email || "—"}
          </p>
          <p>
            <strong>Phone:</strong> {order.client?.phone || "—"}
          </p>
          {/* <p>
            <strong>Client:</strong> {order.client?.name ?? order.client?.email ?? "—"}
          </p>
          <p>
            <strong>Email:</strong> {order.client?.email ?? "—"}</p>
          <p>
            <strong>Phone:</strong> {order.client?.phone ?? "—"}</p> */}
          {/* <p>
            <strong>Quantity:</strong> {order.quantity ?? "—"}</p>
          <p>
            <strong>Delivery location:</strong> {order.deliveryLocation ?? "—"}</p> */}
          <p>
            <strong>Quantity:</strong> {order.product?.totalQuantity ?? "—"}
          </p>

          <p>
            <strong>Delivery location:</strong> {order.deliveryLocation || "—"}
          </p>

          <p>
            <strong>Target ship date:</strong>{" "}
            {order.targetShipDate
              ? new Date(order.targetShipDate).toLocaleDateString()
              : "—"}
          </p>

          <p>
            <strong>Expected delivery:</strong>{" "}
            {order.expectedDeliveryDate
              ? new Date(order.expectedDeliveryDate).toLocaleDateString()
              : "—"}
          </p>
          {/* <p>
            <strong>Target ship date:</strong>{" "}
            {order.targetShipDate ? new Date(order.targetShipDate).toLocaleDateString() : "—"}
          </p>
          <p>
            <strong>Expected delivery:</strong>{" "}
            {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : "—"}
          </p> */}
        </div>
      </div>

      {/* -------- Share Status Button -------- */}
      <div className="mt-4">
        <button
          onClick={handleShareStatus}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
        >
          Share Status
        </button>
        {copied && <span className="ml-2 text-green-300">Copied!</span>}
      </div>

      {/* -------- Production Status -------- */}
      <section className="mt-6 text-black">
        <h3 className="font-bold text-xl mb-2">Production Status</h3>
        <p className="mb-4">
          Current status:{" "}
          <span className="font-semibold text-blue-600">
            {order.status?.currentStatus ?? "—"}
          </span>
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="p-2 rounded"
          >
            <option>Order Created</option>
            <option>Fabric Sourcing</option>
            <option>Fabric Cutting</option>
            <option>Stitching</option>
            <option>Garment QC</option>
            <option>Printing</option>
            <option>Printed Garment QC</option>
            <option>Packing</option>
            <option>Shipping</option>
            <option>Delivered</option>
          </select>

          <input
            type="text"
            value={newStatusNote}
            onChange={(e) => setNewStatusNote(e.target.value)}
            placeholder="Add note..."
            className="flex-1 p-2 rounded"
          />

          <input
            type="file"
            multiple
            onChange={handleFilesChange}
            className="p-1 rounded"
          />

          <button
            onClick={handleAddStatus}
            disabled={adding}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
          >
            {adding ? "Updating..." : "Update Status"}
          </button>
        </div>

        {selectedFiles.length > 0 && (
          <div className="flex gap-2 mt-2">
            {selectedFiles.map((file, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(file)}
                alt={file.name}
                style={{ width: "80px", height: "80px", objectFit: "cover" }}
              />
            ))}
          </div>
        )}

        <h3 className="font-bold mb-2">Status history</h3>
        {statusHistory.length === 0 ? (
          <p className="text-gray-400">No updates yet</p>
        ) : (
          <ul className="space-y-3">
            {statusHistory.map((s, i) => (
              <li key={i} className="border-l-2 border-blue-600 pl-3">
                <div className="font-semibold">{s.status}</div>
                {s.notes && <div className="text-gray-400">{s.notes}</div>}
                <div className="text-xs text-gray-500">
                  by {s.updatedBy ?? "-"} at{" "}
                  {s.updatedAt ? new Date(s.updatedAt).toLocaleString() : "-"}
                </div>
                {Array.isArray(s.images) && s.images.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {s.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt=""
                        className="w-20 h-20 object-cover"
                      />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* -------- Files Section -------- */}
      <section className="mt-6">
        <h4 className="font-bold">Files</h4>
        {order.files?.length ? (
          <ul className="list-disc pl-5 text-black">
            {order.files.map((f, i) => (
              <li key={i}>
                <a
                  href={f}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 underline"
                >
                  {f}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-black">No files</p>
        )}
      </section>

      {/* -------- Manufacturing Details -------- */}
      <section className="mt-6 text-black">
        <h4 className="font-bold">Manufacturing details</h4>
        <p>
          <strong>Company:</strong>{" "}
          {order.manufacturingDetails?.companyName || "—"}
        </p>
        <p>
          <strong>Contact:</strong>{" "}
          {order.manufacturingDetails?.contactPerson || "—"}
        </p>

        <p>
          <strong>Location:</strong>{" "}
          {order.manufacturingDetails?.location
            ? [
                order.manufacturingDetails.location.address,
                order.manufacturingDetails.location.city,
                order.manufacturingDetails.location.state,
                order.manufacturingDetails.location.postalCode,
                order.manufacturingDetails.location.country,
              ]
                .filter(Boolean)
                .join(", ") || "—"
            : "—"}
        </p>
      </section>
    </div>
  );
}
