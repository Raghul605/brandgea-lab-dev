import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, showToast } from "../utils/helpers";
import ToastNotification from "../components/UI/ToastNotification";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email && token) {
      fetchOrders();
    }
  }, [user, token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user-order/all-orders`,
        { params: { email: user.email } }
      );

      const mapped = response.data.map((o) => ({
        _id: o._id,
        productName: o.product?.productName || "",
        garmentType: o.product?.garmentType || "N/A",
        totalQuantity: o.product?.totalQuantity || 0,
        totalLotValue: o.product?.totalLotValue || 0,
        status: o.status?.currentStatus || "Order Created",
        productImage: o.files?.[0] || null,
      }));

      setOrders(mapped);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast(setToast, "Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

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
          {/* Mobile/Tablet list */}
          <ul className="grid gap-4 md:hidden">
            {orders.map((order) => (
              <li key={order._id}>
                <button
                  type="button"
                  onClick={() => handleRowClick(order)}
                  className="w-full text-left bg-white dark:bg-black rounded-xl shadow border border-gray-100 dark:border-[#333333] overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex gap-3 p-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-[#333333] bg-transparent">
                      {order.productImage ? (
                        <img
                          loading="lazy"
                          src={order.productImage}
                          alt={`Order ${order._id} image`}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        // Empty area if no image
                        <div className="h-full w-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {/* {order.garmentType} */}
                          {order.productName}
                        </p>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                          Order ID: {order._id}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(order.totalLotValue)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Qty: {order.totalQuantity}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
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
                              src={order.productImage}
                              alt={order.garmentType}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {order.garmentType}
                            </div>
                            <div className="text-gray-500 text-sm dark:text-gray-400">
                              Order ID: {order._id}
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
                          {formatCurrency(order.totalLotValue)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Qty: {order.totalQuantity}
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
