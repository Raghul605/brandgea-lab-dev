// import React, { useRef } from "react";
// import { FiX } from "react-icons/fi";
// import { GoPlusCircle } from "react-icons/go";
// import { MdArrowOutward } from "react-icons/md";

// export default function ProductDescriptionForm({
//   inputText,
//   setInputText,
//   isLoading,
//   handleSubmit,
//   imagePreviews,
//   handleRemoveImage,
//   handleImageSelect,
// }) {
//   const fileInputRef = useRef(null);

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="bg-gradient-to-br from-[#FCFEFF] to-[#F0EDFF] rounded-2xl p-4 space-y-4">

//         {/* Image Preview */}
//         {imagePreviews && imagePreviews.length > 0 && (
//           <div className="flex flex-wrap gap-2">
//             {imagePreviews.map((preview, index) => (
//               <div key={index} className="relative w-36 h-36">
//                 <img
//                   src={preview}
//                   alt={`Product Preview ${index + 1}`}
//                   className="w-full h-full object-cover rounded-xl border border-gray-300"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => handleRemoveImage(index)}
//                   className="absolute top-1.5 right-1.5 bg-black rounded-full p-1 shadow-sm hover:bg-gray-900 transition-colors cursor-pointer"
//                   aria-label={`Remove image ${index + 1}`}
//                 >
//                   <FiX className="w-4 h-4 text-white" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}

//         <label htmlFor="description" className="sr-only">
//           Product Description
//         </label>
//         <textarea
//           id="description"
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//           placeholder="Example: Category: T-Shirt; Color: Black; Fabric: 100% Cotton; GSM: 220; Fit: Regular..."
//           className="w-full min-h-[140px] p-6 border border-gray-200 text-gray-700 text-sm rounded-xl placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//           disabled={isLoading}
//         />

//         <div className="flex justify-between items-center">
//           <input
//             type="file"
//             ref={fileInputRef}
//             accept="image/jpeg,image/png,image/webp"
//             className="hidden"
//             multiple
//             onChange={handleImageSelect}
//             disabled={isLoading}
//           />
//           <button
//             type="button"
//             className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
//             onClick={() => fileInputRef.current.click()}
//             disabled={isLoading || (imagePreviews && imagePreviews.length >= 2)}
//           >
//             <GoPlusCircle className="w-6 h-6" />
//             <span className="text-sm font-medium transition-colors">
//               Image ({imagePreviews ? imagePreviews.length : 0}/2)
//             </span>
//           </button>
//           <button
//             type="submit"
//             className="flex gap-2 items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
//             disabled={isLoading || !inputText.trim()}
//           >
//             {isLoading ? (
//               <span className="text-black text-sm font-medium">Processing...</span>
//             ) : (
//               <>
//                 <span className="text-black text-sm font-medium">Get Quote</span>
//                 <div className="p-2 bg-black rounded-full">
//                   <MdArrowOutward className="w-5 h-5 text-white" />
//                 </div>
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </form>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { GoPlusCircle } from "react-icons/go";
import { MdArrowOutward } from "react-icons/md";
import { IoIosAttach, IoIosLink } from "react-icons/io";

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
  const [isDragging, setIsDragging] = useState(false);

  // drag & drop images
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dtFiles = Array.from(e.dataTransfer.files || []);
    if (dtFiles.length) {
      const evt = { target: { files: dtFiles } };
      handleImageSelect(evt);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="fixed bottom-20 left-0 right-0 lg:left-64 z-10 lg:z-40  px-3 sm:px-4 pt-2 pb-3"
    >
      <div
        className={`relative mx-auto max-w-3xl overflow-hidden
          rounded-2xl border shadow-[0_4px_24px_rgba(0,0,0,0.06)]
          border-gray-200/70 dark:border-[#333333]
          bg-white/90 dark:bg-black/90 backdrop-blur
          ${isDragging ? "ring-2 ring-gray-500" : ""}
        `}
      >
        {/* Top: Images (if any) */}
        {imagePreviews.length > 0 && (
          <div className="px-3 pt-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative w-28 h-28 shrink-0">
                  <img
                    src={src}
                    alt={`Product Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl border border-gray-200 dark:border-[#333333]"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1.5 right-1.5 bg-[#060A21] dark:bg-gray-700 rounded-full p-1 hover:opacity-90"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <FiX className="w-4 h-4 text-white cursor-pointer" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-3 sm:px-4 pt-2">
          <label htmlFor="description" className="sr-only">
            Product Description
          </label>
          <textarea
            id="description"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Example: White T-Shirt 100% Cotton 220GSM"
            className="w-full min-h-[88px]  dark:border-[#333333] rounded-xl placeholder:text-xs   bg-white dark:bg-black border border-transparent text-xs sm:text-sm text-[#060A21] dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400
            px-3 py-3 transition-all  focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-[#333333]"
            disabled={isLoading}
          />
        </div>

        {/* Bottom bar: actions */}
        <div className="px-3 sm:px-4 pb-2">
          <div className="flex justify-between items-center gap-3">
            {/* Hidden file input */}
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
              onClick={() => fileInputRef.current.click()}
              disabled={
                isLoading || (imagePreviews && imagePreviews.length >= 2)
              }
              className="inline-flex items-center gap-1 text-xs sm:text-sm rounded-full px-2 py-1
                         border border-gray-200 dark:border-gray-600
                         text-gray-800 dark:text-white bg-white dark:bg-black
                         hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IoIosLink className="w-4 h-4" />
              Attach
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[#060A21] text-white hover:opacity-90 cursor-pointer disabled:opacity-50  transition dark:bg-white dark:text-black"
                aria-label="Get Estimate"
              >
                {isLoading ? (
                  <span className="text-sm">Processing…</span>
                ) : (
                  <>
                    <span className="sm:text-sm text-xs xs:inline">
                      Estimate
                    </span>
                    <span className="p-1  rounded-full bg-white/10 dark:bg-black/10">
                      <MdArrowOutward className="w-4 h-4" />
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Drag overlay cue */}
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-dashed border-[#060A21]/50"></div>
        )}
      </div>
    </form>
  );
}
