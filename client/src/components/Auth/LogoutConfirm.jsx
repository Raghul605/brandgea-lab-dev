import React, { useEffect, useRef } from "react";
import { FiX, FiLogOut } from "react-icons/fi";

export default function LogoutConfirm({ isOpen, onClose, onConfirm }) {
  const dialogRef = useRef(null);
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus primary action when opened
    const t = setTimeout(() => confirmBtnRef.current?.focus(), 0);

    // Close on ESC
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
      onMouseDown={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-white/20 backdrop-blur-sm transition-opacity" />

      {/* Panel */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-sm rounded-xl border border-white/20 
                   bg-white/95 shadow-2xl ring-1 ring-black/5 dark:ring-[#333333] backdrop-blur-md 
                   dark:bg-black dark:border-[#575757]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b dark:border-[#333333] border-gray-100 ">
          <h3
            id="logout-title"
            className="text-base font-medium text-gray-900 dark:text-gray-100"
          >
            Confirm Logout
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100
                       dark:text-white dark:hover:text-gray-200 dark:hover:bg-[#242424]
                       transition-colors"
            aria-label="Close"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-5">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            Are you sure you want to log out?
          </p>

          {/* Actions */}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium
                         text-gray-800 bg-gray-100 hover:bg-gray-200
                         dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
                         transition-colors focus:outline-none focus-visible:ring-2
                         focus-visible:ring-offset-1 focus-visible:ring-gray-300
                         dark:focus-visible:ring-gray-500"
            >
              Cancel
            </button>

            <button
              ref={confirmBtnRef}
              onClick={onConfirm}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                         text-white transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
                         shadow-sm active:scale-[0.98]
                         hover:opacity-95
                         [background-color:#060A21] dark:bg-white dark:text-black focus-visible:ring-[#060A21]/40"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
