import React, { useRef } from "react";
import { BiImage } from "react-icons/bi";
import { FiX } from "react-icons/fi";

export default function ImageAttachmentModal({
  isOpen,
  setIsOpen,
  handleImageSelect,
}) {
  const fileInputRef = useRef(null);
  
  
  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate image count (1-2)
    if (files.length > 2) {
      alert("Please select only 1-2 images");
      e.target.value = "";
      return;
    }

    // Validate file types
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert("Please select only JPG, PNG, or WebP images");
      e.target.value = "";
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      alert("Images must be less than 5MB each");
      e.target.value = "";
      return;
    }

    handleImageSelect(e);
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-[#111317] border border-gray-700 rounded-xl p-6 w-full max-w-md">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">
            Attach Product Images
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
          <BiImage className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">
            Upload 1-2 product reference images
          </p>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
            multiple
          />

          <label
            htmlFor="image-upload"
            className="inline-block px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 cursor-pointer"
          >
            Select Images
          </label>
          <p className="text-xs text-gray-500 mt-3">JPG, PNG, or WebP (Max 5MB each)</p>
        </div>

        {/* Information Footer */}
        <div className="mt-4 p-3 bg-gray-900 rounded-lg">
          <p className="text-sm text-gray-400">
            Images will be securely uploaded to our servers when you submit your quote request.
            We'll analyze them to provide the most accurate manufacturing estimate.
          </p>
        </div>
      </div>
    </div>
  );
}