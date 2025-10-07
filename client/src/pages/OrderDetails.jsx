import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { formatCurrency } from "../utils/helpers";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

const STATUS_STEPS = [
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

export default function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { state } = useLocation();

  const [order, setOrder] = useState(state?.order || null);
  const [loading, setLoading] = useState(!state?.order);
  useEffect(() => {
    const needsServerData =
      !order || !order.status || !Array.isArray(order.status.statusHistory);

    if (orderId && needsServerData) fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/user-order/order-details/${orderId}`
      );
      setOrder(resp.data);
    } catch (err) {
      console.error("Error loading order details", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-700 dark:text-gray-300">
            Order not found.{" "}
            <button
              onClick={() => navigate("/orders")}
              className="text-blue-600 dark:text-blue-400 underline"
            >
              Go back to Orders
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Top bar */}
      <div className="flex items-start justify-between mb-5">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 hover:opacity-80"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 19L8 12L15 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              Order #{(order._id || "").substring(0, 8)}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            {new Date(order.createdAt || Date.now()).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}{" "}
            • created by admin
          </p>
        </div>
      </div>

      {/* Product Section */}
      <section className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-[#333333] p-4 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <div className="w-full lg:w-56 xl:w-64">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-gray-200 dark:border-[#333333] bg-white">
              <img
                src={
                  order.files?.[0] ||
                  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1770&auto=format&fit=crop"
                }
                alt={order.product?.garmentType}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                  {order.product?.garmentType || "N/A"}
                </h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {order.serviceType}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Info label="Price">
                {formatCurrency(order.product?.totalLotValue)}
              </Info>
              <Info label="Quantity">{order.product?.totalQuantity}</Info>
              <Info label="Estimated Delivery">
                {order.expectedDeliveryDate
                  ? new Date(order.expectedDeliveryDate).toLocaleDateString()
                  : "N/A"}
              </Info>
            </div>

            <div className="mt-4">
              <Info label="Delivery Location">
                {order.deliveryLocation || "N/A"}
              </Info>
            </div>
          </div>
        </div>
      </section>

      {/* Vertical Status Timeline (mobile, tablet, desktop all use vertical) */}
      <section className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-[#333333] p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Production Status
        </h3>

        <div className="relative">
          {/* The vertical line */}
          <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-[#646464]"></div>
          <ul className="space-y-6 sm:space-y-8">
            {STATUS_STEPS.map((step, idx) => {
              const update = order.status?.statusHistory?.find(
                (s) => s.status === step
              );

              const currentStatus = order.status?.currentStatus;
              const currentIndex = STATUS_STEPS.indexOf(currentStatus);

              const isCompleted = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              const circleStyles = isCompleted
                ? "bg-black text-white border-black dark:border-white"
                : isCurrent
                ? "bg-blue-500 text-white dark:border-black dark:border-blue-500 border-white"
                : "bg-white text-gray-400 border-gray-300 dark:border-[#333333]";

              return (
                <li key={step} className="relative pl-12 sm:pl-14">
                  {/* Node */}
                  <div
                    className={`absolute left-2 sm:left-3.5 top-0 w-5 h-5 sm:w-6 sm:h-6 
          rounded-full border flex items-center justify-center ${circleStyles}`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 " />
                    ) : (
                      <DotIcon className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <h4
                      className={`text-sm sm:text-base font-medium ${
                        isCompleted || isCurrent
                          ? "text-gray-900 dark:text-gray-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {step}
                    </h4>

                    {update?.updatedAt && (
                      <span className="hidden md:inline text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(update.updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {update?.notes && (
                    <p className="text-xs text-gray-600 dark:text-gray-200 mt-2">
                      {update.notes}
                    </p>
                  )}

                  {Array.isArray(update?.images) &&
                    update.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {update.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`${step}-update-${i}`}
                            className="w-20 h-20 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Info({ label, children }) {
  return (
    <div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="font-medium text-gray-900 dark:text-white">
        {children}
      </div>
    </div>
  );
}

function CheckIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
function DotIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}
