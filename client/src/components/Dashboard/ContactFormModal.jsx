import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

export default function ContactFormModal({
  isOpen,
  onClose,
  userProfile,
  onSubmit,
  quoteData,
}) {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill form when userProfile changes or modal opens
  useEffect(() => {
    if (isOpen && userProfile) {
      setFormData({
        name: userProfile.name || "",
        mobile: userProfile.mobile || "",
        email: userProfile.email || "",
      });
    }
  }, [isOpen, userProfile, quoteData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
      });
    } catch (err) {
      setError(err.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Contact Manufacturing Team
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-black text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="mobile"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mobile Number
            </label>
            <input
              type="tel"
              name="mobile"
              id="mobile"
              value={formData.mobile}
              inputMode="numeric"
              pattern="^\\+?[0-9\\s\\-]{10,15}$"
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 text-black rounded-lg text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 text-black rounded-lg text-sm"
              required
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Buttons with reversed order on mobile */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium text-sm transition mt-2 sm:mt-0"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 text-white bg-gray-900 rounded-lg hover:bg-gray-800 font-medium text-sm transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}