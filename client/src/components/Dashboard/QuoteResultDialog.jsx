import React from "react";
import { FiX } from "react-icons/fi";

export default function QuoteResultDialog({
  isOpen,
  handleReset,
  quoteData,
  onContactClick,
  onClose
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Your AI Quotation</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {quoteData && (
          <div className="space-y-6 p-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">
                Production Analysis:
              </h4>
              <p className="text-gray-700">{quoteData.message}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold rounded-tl-xl">
                      Quantity
                    </th>
                    <th className="text-left p-3 font-semibold">Unit Price</th>
                    <th className="text-left p-3 font-semibold rounded-tr-xl">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(quoteData.pricing).map(([qty, priceInfo]) => (
                    <tr
                      key={qty}
                      className="border-b  border-gray-200 hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium ">{qty} pcs</td>
                      <td className="p-3">
                        {priceInfo.currency} {priceInfo.price.toFixed(2)}
                      </td>
                      <td className="p-3 font-semibold">
                        {priceInfo.currency}{" "}
                        {(priceInfo.price * parseInt(qty)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-600 italic">
              * If you have a better quote, we can match or beat it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleReset}
                className="bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Create New Quote
              </button>
              <button
                onClick={onContactClick}
                className="text-white font-semibold py-3 px-6 rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800"
              >
                Contact for Manufacturing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
