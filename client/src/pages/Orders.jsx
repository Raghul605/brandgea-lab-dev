import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, showToast } from "../utils/helpers";
import ToastNotification from "../components/UI/ToastNotification";
import { useNavigate } from "react-router-dom";

// ---------- MOCK DATA (remove when wiring to API) ----------
const MOCK_ORDERS = [
  {
    _id: "1001",
    productName: "Unisex 240 GSM Terry Tee",
    category: "Oversized T-Shirt",
    status: "Order Created",
    price: 125000,
    quantity: 500,
    shippingAddress: "K.Nattapatti, Madurai",
    productImage:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop",
    statusUpdates: {
      "Order Created": {
        notes:
          "PO received and order created in system. Awaiting fabric shortlist from buyer.",
        timestamp: "2025-09-08T10:15:00+05:30",
        image:
          "https://images.unsplash.com/photo-1581091870622-7f3c46f2b7b0?q=80&w=1200&auto=format&fit=crop",
      },
      // No entries beyond current step
    },
  },
  {
    _id: "1002",
    productName: "Oversized Hoodie 400 GSM",
    category: "Hoodie",
    status: "Fabric Sourcing",
    price: 420000,
    quantity: 800,
    shippingAddress: "K.Nattapatti, Madurai",
    productImage:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop",
    statusUpdates: {
      "Order Created": {
        notes: "Order opened; BOM drafted and shared with sourcing.",
        timestamp: "2025-09-07T09:20:00+05:30",
      },
      "Fabric Sourcing": {
        notes:
          "Supplier A & B samples received. 400 GSM fleece in black shortlisted for lab dip.",
        timestamp: "2025-09-09T14:40:00+05:30",
        image:
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop",
      },
    },
  },
  {
    _id: "1003",
    productName: "Polo Tee with Embroidery",
    category: "T-Shirt",
    status: "Fabric Cutting",
    price: 98000,
    quantity: 200,
    shippingAddress: "K.Nattapatti, Madurai",
    productImage:
      "https://images.unsplash.com/photo-1520975657288-6a2c231b4469?q=80&w=1200&auto=format&fit=crop",
    statusUpdates: {
      "Order Created": {
        notes: "Approved strike-off for embroidery; tech pack frozen.",
        timestamp: "2025-09-05T11:00:00+05:30",
      },
      "Fabric Sourcing": {
        notes: "Piqué cotton rolls received; QC pass (AQL 2.5).",
        timestamp: "2025-09-06T17:30:00+05:30",
        image:
          "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop",
      },
      "Fabric Cutting": {
        notes: "Marker made, cutting started on lay-8; yield on target.",
        timestamp: "2025-09-09T10:05:00+05:30",
        image:
          "https://images.unsplash.com/photo-1503342217505-b0a15cf70489?q=80&w=1200&auto=format&fit=crop",
      },
    },
  },
  {
    _id: "1004",
    productName: "Custom Printed Tees",
    category: "T-Shirt",
    status: "Stitching",
    price: 155000,
    quantity: 350,
    shippingAddress: "K.Nattapatti, Madurai",
    productImage:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1200&auto=format&fit=crop",
    statusUpdates: {
      "Order Created": {
        notes: "Designs locked; DTF transfer vendor confirmed.",
        timestamp: "2025-09-04T13:45:00+05:30",
      },
      "Fabric Sourcing": {
        notes: "Combed cotton jersey 180 GSM received.",
        timestamp: "2025-09-06T09:15:00+05:30",
      },
      "Fabric Cutting": {
        notes: "All sizes cut; size ratio 1:1:1:1:1.",
        timestamp: "2025-09-07T18:25:00+05:30",
      },
      Stitching: {
        notes: "Line-2 allocated; 38% WIP completed.",
        timestamp: "2025-09-09T16:10:00+05:30",
        image:
          "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop",
      },
    },
  },
  {
    _id: "1005",
    productName: "Athleisure Joggers",
    category: "Joggers",
    status: "Garment QC",
    price: 210000,
    quantity: 400,
    shippingAddress: "K.Nattapatti, Madurai",
    productImage:
      "https://images.unsplash.com/photo-1618354691418-45e8e927b4b9?q=80&w=1200&auto=format&fit=crop",
    statusUpdates: {
      "Order Created": {
        notes: "PO acknowledged; trims list finalized.",
        timestamp: "2025-09-03T10:00:00+05:30",
      },
      "Fabric Sourcing": {
        notes: "Poly-spandex fleece lot received.",
        timestamp: "2025-09-04T12:30:00+05:30",
      },
      "Fabric Cutting": {
        notes: "Cutting completed; wastage within 1.8%.",
        timestamp: "2025-09-05T17:00:00+05:30",
      },
      Stitching: {
        notes: "Stitching done; drawcord & eyelets fitted.",
        timestamp: "2025-09-07T15:35:00+05:30",
      },
      "Garment QC": {
        notes: "Inline QC pass rate 97.2%; rework negligible.",
        timestamp: "2025-09-09T11:55:00+05:30",
        image:
          "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=1200&auto=format&fit=crop",
      },
    },
  },
  {
    _id: "1006",
    productName: "Graphic Tees (DTF)",
    category: "T-Shirt",
    status: "Printing",
    price: 132000,
    quantity: 300,
    shippingAddress: "K.Nattapatti, Madurai",
    productImage:
      "https://images.unsplash.com/photo-1520974836861-55f0b2546b1a?q=80&w=1200&auto=format&fit=crop",
    statusUpdates: {
      "Order Created": {
        notes: "Artworks CMYK-optimized for DTF.",
        timestamp: "2025-09-06T08:20:00+05:30",
      },
      "Fabric Sourcing": {
        notes: "Fabric in-house; shrinkage verified at 3%.",
        timestamp: "2025-09-07T10:45:00+05:30",
      },
      "Fabric Cutting": {
        notes: "Cut panels sorted by bundle.",
        timestamp: "2025-09-08T13:05:00+05:30",
      },
      Stitching: {
        notes: "Neck rib attached; side seams completed.",
        timestamp: "2025-09-08T19:20:00+05:30",
      },
      Printing: {
        notes: "DTF transfers applied on 40% pieces.",
        timestamp: "2025-09-09T15:10:00+05:30",
        image:
          "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=1200&auto=format&fit=crop",
      },
    },
  },
  {
    _id: "1007",
    productName: "Printed Hoodies",
    category: "Hoodie",
    status: "Printed Garment QC",
    price: 265000,
    quantity: 450,
    shippingAddress: "K.Nattapatti, Madurai",
    productImage:
      "https://images.unsplash.com/photo-1520975940462-36a92c1b53a2?q=80&w=1200&auto=format&fit=crop",
    statusUpdates: {
      "Order Created": {
        notes: "Order kicked off; hood drawcords color-matched.",
        timestamp: "2025-09-02T11:40:00+05:30",
      },
      "Fabric Sourcing": {
        notes: "Brushed fleece procured from Vendor K.",
        timestamp: "2025-09-03T16:25:00+05:30",
      },
      "Fabric Cutting": {
        notes: "Cutting & bundling completed.",
        timestamp: "2025-09-04T18:10:00+05:30",
      },
      Stitching: {
        notes: "All panels stitched; kangaroo pocket aligned.",
        timestamp: "2025-09-06T10:00:00+05:30",
      },
      Printing: {
        notes: "Screen prints cured; adhesion OK.",
        timestamp: "2025-09-07T19:45:00+05:30",
      },
      "Printed Garment QC": {
        notes: "Print QC underway; 20 defects flagged for touch-up.",
        timestamp: "2025-09-09T12:50:00+05:30",
        image:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
      },
    },
  },
  {
    _id: "1008",
    productName: "Basic Track Pants",
    category: "Track Pants",
    status: "Packing",
    price: 175000,
    quantity: 380,
    shippingAddress: "K.Nattapatti, Madurai",
    productImage:
      "https://images.unsplash.com/photo-1562158070-5bf9f1f3a3f2?q=80&w=1200&auto=format&fit=crop",
    statusUpdates: {
      "Order Created": {
        notes: "Order confirmed; hangtags finalized.",
        timestamp: "2025-09-01T09:30:00+05:30",
      },
      "Fabric Sourcing": {
        notes: "Interlock fabric sourced locally.",
        timestamp: "2025-09-02T14:05:00+05:30",
      },
      "Fabric Cutting": {
        notes: "Cut parts packed by size bundles.",
        timestamp: "2025-09-03T18:40:00+05:30",
      },
      Stitching: {
        notes: "Elastic waistband and cuffs attached.",
        timestamp: "2025-09-05T12:15:00+05:30",
      },
      "Garment QC": {
        notes: "Final QC pass 96.5%.",
        timestamp: "2025-09-06T17:55:00+05:30",
      },
      Printing: {
        notes: "Brand mark heat-transfer applied.",
        timestamp: "2025-09-07T10:20:00+05:30",
      },
      "Printed Garment QC": {
        notes: "Transfers checked for peel; OK.",
        timestamp: "2025-09-07T16:45:00+05:30",
      },
      Packing: {
        notes: "Polybag + carton packing in progress.",
        timestamp: "2025-09-09T09:05:00+05:30",
        image:
          "https://images.unsplash.com/photo-1581092334607-1e7eab0a3f5c?q=80&w=1200&auto=format&fit=crop",
      },
    },
  },
  {
    _id: "1009",
    productName: "Sports Jerseys",
    category: "Jersey",
    status: "Shipping",
    price: 320000,
    quantity: 600,
    shippingAddress: "K.Nattapatti, Madurai",
    productImage:
      "https://images.unsplash.com/photo-1503341338985-c0477be52513?q=80&w=1200&auto=format&fit=crop",
    statusUpdates: {
      "Order Created": {
        notes: "Bulk PO received; sizes locked.",
        timestamp: "2025-08-30T08:10:00+05:30",
      },
      "Fabric Sourcing": {
        notes: "Poly mesh acquired; breathability test passed.",
        timestamp: "2025-08-31T13:10:00+05:30",
      },
      "Fabric Cutting": {
        notes: "Auto-cutter used; minimal wastage.",
        timestamp: "2025-09-01T15:30:00+05:30",
      },
      Stitching: {
        notes: "Sleeves and side panels attached.",
        timestamp: "2025-09-03T11:25:00+05:30",
      },
      Printing: {
        notes: "Numbers & names sublimated.",
        timestamp: "2025-09-05T18:00:00+05:30",
      },
      "Printed Garment QC": {
        notes: "Color fastness checked; OK.",
        timestamp: "2025-09-06T12:35:00+05:30",
      },
      Packing: {
        notes: "Cartons sealed with export labels.",
        timestamp: "2025-09-07T16:30:00+05:30",
      },
      Shipping: {
        notes: "Dispatched via BlueDart AWB 1289XXXX.",
        timestamp: "2025-09-09T10:50:00+05:30",
        image:
          "https://images.unsplash.com/photo-1556909172-54557c7e4fb4?q=80&w=1200&auto=format&fit=crop",
      },
    },
  },
  {
    _id: "1010",
    productName: "Premium Piqué Polos",
    category: "T-Shirt",
    status: "Delivered",
    price: 540000,
    quantity: 900,
    shippingAddress: "K.Nattapatti, Madurai",
    productImage:
      "https://images.unsplash.com/photo-1503341338985-c0477be52513?q=80&w=1200&auto=format&fit=crop",
    statusUpdates: {
      "Order Created": {
        notes: "Kickoff done; collar style Button-Down.",
        timestamp: "2025-08-20T10:00:00+05:30",
      },
      "Fabric Sourcing": {
        notes: "Piqué cotton received; shrinkage 4.2% (pre-washed).",
        timestamp: "2025-08-22T15:00:00+05:30",
      },
      "Fabric Cutting": {
        notes: "Lay planning optimized for stripe matching.",
        timestamp: "2025-08-24T09:30:00+05:30",
      },
      Stitching: {
        notes: "Plackets and collars aligned; good finish.",
        timestamp: "2025-08-26T18:45:00+05:30",
      },
      Printing: {
        notes: "Brand chest logo embroidered (not printed).",
        timestamp: "2025-08-28T14:15:00+05:30",
      },
      "Printed Garment QC": {
        notes: "Embroidery threads trimmed; QC pass.",
        timestamp: "2025-08-29T11:20:00+05:30",
      },
      Packing: {
        notes: "Folded, size stickered, boxed.",
        timestamp: "2025-08-30T16:55:00+05:30",
      },
      Shipping: {
        notes: "Shipped via VRL; LR# 77XX34.",
        timestamp: "2025-09-01T08:05:00+05:30",
      },
      Delivered: {
        notes: "Delivered to consignee. POD uploaded.",
        timestamp: "2025-09-03T13:40:00+05:30",
        image:
          "https://images.unsplash.com/photo-1515165562835-c3b8c8e3f4a0?q=80&w=1200&auto=format&fit=crop",
      },
    },
  },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // ---------- USE MOCK DATA NOW ----------
    setLoading(true);
    // Simulate a short load so the spinner shows nicely
    const timer = setTimeout(() => {
      setOrders(MOCK_ORDERS);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);

    // ---------- API FETCH (restore this later) ----------
    // if (user && token) { fetchOrders(); }
  }, [user, token]);

  // const fetchOrders = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/orders/user-orders/${user.id}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     setOrders(response.data.orders || []);
  //   } catch (error) {
  //     console.error("Error fetching orders:", error);
  //     showToast(setToast, "Failed to load orders", "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleRowClick = (order) => {
    navigate(`/orders/${order._id}`, { state: { order } });
  };
  const getStatusColor = (status) => {
    const baseLight = {
      blue: "bg-blue-100 text-blue-700 border border-blue-200",
      amber: "bg-amber-100 text-amber-700 border border-amber-200",
      purple: "bg-purple-100 text-purple-700 border border-purple-200",
      cyan: "bg-cyan-100 text-cyan-700 border border-cyan-200",
      green: "bg-green-100 text-green-700 border border-green-200",
      gray: "bg-gray-100 text-gray-700 border border-gray-200",
    };

    // Dark-mode: translucent fill on black + subtle ring (no low-contrast borders)
    const baseDark = {
      blue: "dark:bg-blue-500/15 dark:text-blue-200 dark:ring-1 dark:ring-blue-400/40 dark:border-transparent",
      amber:
        "dark:bg-amber-500/15 dark:text-amber-200 dark:ring-1 dark:ring-amber-400/40 dark:border-transparent",
      purple:
        "dark:bg-purple-500/15 dark:text-purple-200 dark:ring-1 dark:ring-purple-400/40 dark:border-transparent",
      cyan: "dark:bg-cyan-500/15 dark:text-cyan-200 dark:ring-1 dark:ring-cyan-400/40 dark:border-transparent",
      green:
        "dark:bg-green-500/15 dark:text-green-200 dark:ring-1 dark:ring-green-400/40 dark:border-transparent",
      gray: "dark:bg-white/10 dark:text-gray-200 dark:ring-1 dark:ring-white/20 dark:border-transparent",
    };

    const paletteByStatus = {
      "Order Created": "blue",
      "Fabric Sourcing": "blue",
      "Fabric Cutting": "blue",

      Stitching: "amber",
      "Garment QC": "amber",
      Printing: "amber",

      "Printed Garment QC": "purple",

      Packing: "cyan",
      Shipping: "cyan",

      Delivered: "green",
    };

    const key = paletteByStatus[status] || "gray";
    return `${baseLight[key]} ${baseDark[key]}`;
  };

  const getStatusProgress = (status) => {
    const statusOrder = [
      "Order Created",
      "Fabric Sourcing",
      "Fabric Cutting",
      "Stitching",
      "Garment QC",
      "Printing",
      "Printed Garment QC",
      "Packing",
      "Shipping",
      "Delivered",
    ];
    const currentIndex = statusOrder.indexOf(status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
        Orders
      </h1>
      {orders.length === 0 ? (
        <div className="bg-white dark:bg-black rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Your orders will appear here once you've completed a purchase.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile/Tablet: Card list (default) */}

          <ul className="grid gap-4 md:hidden">
            {orders.map((order) => (
              <li key={order._id}>
                <button
                  type="button"
                  onClick={() => handleRowClick(order)}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === "") && handleRowClick(order)
                  }
                  className="w-full text-left bg-white dark:bg-black rounded-xl shadow border border-gray-100 dark:border-[#333333] overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
                  role="button"
                  aria-label={`Open order ${order.productName}`}
                >
                  <div className="flex gap-3 p-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-[#333333]">
                      <img
                        loading="laze"
                        src={
                          order.productImage ||
                          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1770&auto=format&fit=crop"
                        }
                        alt={order.productName}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {order.productName}
                          </p>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                            {order.category}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-2 rounded-full h-1 bg-gray-200 dark:bg-white/10">
                        <div
                          className="h-1 rounded-full bg-gray-800 dark:bg-white/70"
                          style={{
                            width: `${getStatusProgress(order.status)}%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(order.price)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Qty: {order.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop */}
          <div className="hidden md:block bg-white dark:bg-black rounded-lg shadow overflow-hidden border border-gray-200 dark:border-[#333333]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-[#333333]">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#333333]">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 dark:hover:bg-[#242424] cursor-pointer transition-colors"
                      onClick={() => handleRowClick(order)}
                      tabIndex={0}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        handleRowClick(order)
                      }
                      role="button"
                      aria-label={`Open order ${order.productName}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-[#333333]">
                            <img
                              loading="lazy"
                              src={
                                order.productImage ||
                                "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1770&auto=format&fit=crop"
                              }
                              alt={order.productName}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {order.productName}
                            </div>
                            <div className="text-gray-500 text-sm dark:text-gray-400">
                              {order.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-2 w-56 bg-gray-200 dark:bg-white/20 rounded-full h-1">
                          <div
                            className="h-1 rounded-full bg-gray-900 dark:bg-white/80"
                            style={{
                              width: `${getStatusProgress(order.status)}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {formatCurrency(order.price)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Qty: {order.quantity}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />
    </div>

    // <div >
    //   <h1 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
    //     Orders
    //   </h1>

    //   {orders.length === 0 ? (
    //     <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    //       <p className="text-gray-600 dark:text-gray-400">
    //         Your orders will appear here once you've completed a purchase.
    //       </p>
    //     </div>
    //   ) : (
    //     <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
    //       <div className="overflow-x-auto">
    //         <table className="w-full">
    //           <thead className="bg-gray-50 dark:bg-gray-700">
    //             <tr>
    //               <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
    //                 Product
    //               </th>
    //               <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
    //                 Status
    //               </th>
    //               <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
    //                 Price
    //               </th>
    //             </tr>
    //           </thead>
    //           <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
    //             {orders.map((order) => (
    //               <tr
    //                 key={order._id}
    //                 className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
    //                 onClick={() => handleRowClick(order)}
    //               >
    //                 <td className="py-4 px-6">
    //                   <div className="flex items-center">
    //                     <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600">
    //                       <img
    //                         src={
    //                           order.productImage ||
    //                           "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1770&auto=format&fit=crop"
    //                         }
    //                         alt={order.productName}
    //                         className="h-full w-full object-cover object-center"
    //                       />
    //                     </div>
    //                     <div className="ml-4">
    //                       <div className="font-medium text-gray-900 dark:text-white">
    //                         {order.productName}
    //                       </div>
    //                       <div className="text-gray-500 dark:text-gray-400">
    //                         {order.category}
    //                       </div>
    //                     </div>
    //                   </div>
    //                 </td>
    //                 <td className="py-4 px-6">
    //                   <div className="flex items-center">
    //                     <span
    //                       className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
    //                         order.status
    //                       )}`}
    //                     >
    //                       {order.status}
    //                     </span>
    //                   </div>
    //                   <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
    //                     <div
    //                       className="bg-blue-500 h-1.5 rounded-full"
    //                       style={{ width: `${getStatusProgress(order.status)}%` }}
    //                     ></div>
    //                   </div>
    //                 </td>
    //                 <td className="py-4 px-6">
    //                   <div className="text-sm text-gray-900 dark:text-white font-medium">
    //                     {formatCurrency(order.price)}
    //                   </div>
    //                   <div className="text-sm text-gray-500 dark:text-gray-400">
    //                     Qty: {order.quantity}
    //                   </div>
    //                 </td>
    //               </tr>
    //             ))}
    //           </tbody>
    //         </table>
    //       </div>
    //     </div>
    //   )}

    //   <ToastNotification
    //     show={toast.show}
    //     message={toast.message}
    //     type={toast.type}
    //     onClose={() => setToast({ show: false, message: "", type: "" })}
    //   />
    // </div>
  );
}
