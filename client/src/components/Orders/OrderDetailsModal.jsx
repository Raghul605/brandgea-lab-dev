// src/components/Orders/OrderDetailsModal.jsx
import React from "react";

const statusSteps = [
  "ORDER CREATED",
  "FABRIC SOURCING",
  "FABRIC CUTTING",
  "STITCHING",
  "GARMENT QC",
  "PRINTING",
  "PRINTED GARMENT QC",
  "PACKING",
  "SHIPPING",
  "DELIVERED",
];

export default function OrderDetailsModal({ order, isOpen, onClose }) {
  if (!isOpen) return null;

  const currentStatusIndex = statusSteps.indexOf(order.status);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-11/12 md:w-3/4 lg:w-2/3 max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Order #{(order._id || "").substring(0, 8)} Tracking
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <h4 className="font-medium text-lg mb-4 text-gray-900 dark:text-white">
                Product Details
              </h4>
              <div className="flex items-start">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                  <img
                    src={order.productImage || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"}
                    alt={order.productName}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="ml-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {order.productName}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 mb-2">
                    {order.category}
                  </div>
                  <div className="flex">
                    <div className="mr-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Price</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        ${order.price}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Quantity</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {order.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-medium text-lg mb-4 text-gray-900 dark:text-white">
                Order Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Order Date</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {new Date(order.orderDate || Date.now()).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {new Date(order.estimatedDelivery || Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Customer</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {order.customerName || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Shipping Address</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {order.shippingAddress || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h4 className="font-medium text-lg mb-4 text-gray-900 dark:text-white">
            Production Status
          </h4>
          <div className="relative">
            <div className="space-y-8">
              {statusSteps.map((step, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                
                return (
                  <div key={step} className="flex items-start">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 ${
                        isCompleted
                          ? "bg-green-100 dark:bg-green-900/30"
                          : isCurrent
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : isCurrent ? (
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h5
                        className={`font-medium ${
                          isCompleted
                            ? "text-green-600 dark:text-green-400"
                            : isCurrent
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {step}
                      </h5>
                      {order.statusUpdates && order.statusUpdates[step] && (
                        <>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            {order.statusUpdates[step].notes}
                          </p>
                          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                            {new Date(
                              order.statusUpdates[step].timestamp
                            ).toLocaleString()}
                          </p>
                          {order.statusUpdates[step].image && (
                            <div className="mt-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                              <img
                                src={order.statusUpdates[step].image}
                                alt={`${step} visual update`}
                                className="rounded h-32 w-full object-cover"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}