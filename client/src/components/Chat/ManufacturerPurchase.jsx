// src/components/ManufacturerPurchase.jsx
import React, { useState } from "react";

export default function ManufacturerPurchase({ chatId }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  const handlePurchaseClick = () => {
    setIsProcessing(true);
    
    // Mock: In a real scenario, this would be the Zoho payment URL
    const paymentUrl = "https://www.zoho.com/in/payments/";
    
    // Open payment page in new tab
    window.open(paymentUrl, "_blank");
    
    // Simulate payment completion after 3 seconds
    setTimeout(() => {
      setIsProcessing(false);
      setIsPurchased(true);
      
      // In a real scenario, you would verify payment via webhook or API call
    }, 3000);
  };

  if (isPurchased) {
    return (
      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-center">
        <p className="text-[13px] sm:text-sm text-green-700 leading-relaxed">
          Payment successful! You'll receive an email with the list of manufacturers within an hour.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 sm:mt-4 text-center">
      <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
        Need a list of manufacturers who produce this product?
      </p>
      <button
        onClick={handlePurchaseClick}
        disabled={isProcessing}
        className={`inline-flex items-center justify-center h-10 sm:h-11 px-4 sm:px-6 rounded-full text-[13px] sm:text-sm font-medium transition-colors active:scale-[0.98] ${
          isProcessing
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isProcessing ? "Redirecting to payment..." : "Get it for ₹999"}
      </button>
    </div>
  );
}