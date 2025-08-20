// src/components/Dashboard/ProductDescriptionForm.jsx
import React, { useRef } from "react";
import { FiX } from "react-icons/fi";
import { GoPlusCircle } from "react-icons/go";
import { MdArrowOutward } from "react-icons/md";

export default function ProductDescriptionForm({
  inputText,
  setInputText,
  isLoading,
  handleSubmit,
  imagePreviews,
  handleRemoveImage,
  handleImageSelect,
}) {
  const fileInputRef = useRef(null);


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-br from-[#FCFEFF] to-[#F0EDFF] rounded-2xl p-4 space-y-4">


        {/* Image Preview */}
        {imagePreviews && imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-36 h-36">
                <img
                  src={preview}
                  alt={`Product Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1.5 right-1.5 bg-black rounded-full p-1 shadow-sm hover:bg-gray-900 transition-colors cursor-pointer"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <FiX className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <label htmlFor="description" className="sr-only">
          Product Description
        </label>
        <textarea
          id="description"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Format Example: Category: T-Shirt; Product Name: Premium Cotton Tee; Variants: [Color: Black, White; Size: S, M, L]; Fabric: 100% Cotton; GSM: 220; Fit: Regular..."
          className="w-full min-h-[140px] p-6 border border-gray-200 text-gray-700 text-sm rounded-xl placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          disabled={isLoading}
        />

        <div className="flex justify-between items-center">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            multiple
            onChange={handleImageSelect}
            disabled={isLoading}
          />
          <button
            type="button"
            className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => fileInputRef.current.click()}
            disabled={isLoading || (imagePreviews && imagePreviews.length >= 2)}
          >
            <GoPlusCircle className="w-6 h-6" />
            <span className="text-sm font-medium transition-colors">
              Attach image ({imagePreviews ? imagePreviews.length : 0}/2)
            </span>
          </button>
          <button
            type="submit"
            className="flex gap-2 items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? (
              <span className="text-black text-sm font-medium">Processing...</span>
            ) : (
              <>
                <span className="text-black text-sm font-medium">Get Quote</span>
                <div className="p-2 bg-black rounded-full">
                  <MdArrowOutward className="w-5 h-5 text-white" />
                </div>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}