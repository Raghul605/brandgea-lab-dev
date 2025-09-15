import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { formatCurrency } from "../utils/helpers";

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

  const order = state?.order;
  const currentStatusIndex = useMemo(
    () => STATUS_STEPS.indexOf(order?.status || ""),
    [order]
  );

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
            {new Date(order.orderDate || Date.now()).toLocaleDateString(
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
                  order.productImage ||
                  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1770&auto=format&fit=crop"
                }
                alt={order.productName}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                  {order.productName}
                </h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {order.category}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Info label="Price">{formatCurrency(order.price)}</Info>
              <Info label="Quantity">{order.quantity}</Info>
              <Info label="Estimated Delivery">
                {new Date(
                  order.estimatedDelivery ||
                    Date.now() + 14 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </Info>
            </div>

            <div className="mt-4">
              <Info label="Shipping Address">
                {order.shippingAddress || "N/A"}
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
              const isCompleted = idx < currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;

              const circleStyles = isCompleted
                ? "bg-black text-white border-black dark:border-white"
                : isCurrent
                ? "bg-white text-black border-black dark:border-white"
                : "bg-white text-gray-400 border-gray-300 dark:border-[#333333]";

              const update = order.statusUpdates?.[step];

              return (
                <li key={step} className="relative pl-12 sm:pl-14">
                  {/* Node */}
                  <div
                    className={`absolute left-2 sm:left-3.5 top-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center ${circleStyles}`}
                    aria-hidden="true"
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                    ) : (
                      <DotIcon className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
                    )}
                  </div>

                  {/* Title row with desktop timestamp on the right */}
                  <div className="flex items-start justify-between gap-3">
                    <h4
                      className={`text-sm sm:text-base font-medium ${
                        isCompleted
                          ? "text-gray-900 dark:text-gray-100"
                          : isCurrent
                          ? "text-gray-900 dark:text-gray-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {step}
                    </h4>

                    {/* Desktop timestamp (right side of title) */}
                    {update?.timestamp && (
                      <span className="hidden md:inline text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(update.timestamp).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Mobile timestamp (below title) */}
                  {update?.timestamp && (
                    <span className="md:hidden mt-1 block text-xs text-gray-500 dark:text-gray-400">
                      {new Date(update.timestamp).toLocaleString()}
                    </span>
                  )}

                  {/* Optional content (render only when exists) */}
                  {update && (
                    <div className="mt-2 space-y-2">
                      {update.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-200 leading-relaxed">
                          {update.notes}
                        </p>
                      )}

                      {update.image && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[]
                            .concat(update.image)
                            .filter(Boolean)
                            .map((src, i) => (
                              <div
                                key={`${step}-img-${i}`}
                                className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                              >
                                <img
                                  src={src}
                                  alt={`${step} update ${i + 1}`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            ))}
                        </div>
                      )}
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
