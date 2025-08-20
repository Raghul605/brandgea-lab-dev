import React from "react";
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertCircle, FiX } from "react-icons/fi";

const ToastNotification = ({ show, message, type = "info", onClose }) => {
  if (!show) return null;

  const icons = {
    success: <FiCheckCircle className="w-5 h-5 text-green-500" />,
    error: <FiXCircle className="w-5 h-5 text-red-500" />,
    warning: <FiAlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <FiInfo className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="flex items-center p-4 rounded-lg bg-white shadow-lg border border-gray-200 max-w-md">
        <div className="mr-3">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
          aria-label="Close notification"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;