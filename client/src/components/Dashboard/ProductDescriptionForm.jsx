import React from "react";
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
  setIsImageModalOpen,
  errorText,
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-br from-[#FCFEFF] to-[#F0EDFF] rounded-2xl p-4 space-y-4">

        {errorText && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {errorText}
          </div>
        )}


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
          className="w-full min-h-[140px] p-6 border border-gray-200 text-gray-700 text-sm rounded-xl placeholder:text-sm"
        />

        <div className="flex justify-between">
          <button
            type="button"
            className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-gray-800"
            onClick={() => setIsImageModalOpen(true)}
          >
            <GoPlusCircle className="w-6 h-6 " />
            <span className=" text-sm font-medium  transition-colors">
              Attach image
            </span>
          </button>
          <button
            type="submit"
            className="flex gap-2 items-center cursor-pointer"
            disabled={isLoading}
          >
            <span className="text-black text-sm font-medium">Get Quote</span>
            <div className="p-2 bg-black rounded-full">
              <MdArrowOutward className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </div>
    </form>
  );
}
