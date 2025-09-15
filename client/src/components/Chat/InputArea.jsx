import React from "react";
import { FiArrowUp, FiX } from "react-icons/fi";
import { WiStars } from "react-icons/wi";
import { ImAttachment } from "react-icons/im";

export default function InputArea({
  inputText,
  setInputText,
  handleSendMessage,
  isLoading,
  imagePreviews,
  handleRemoveImage,
  handleImageSelect,
  fileInputRef,
  isChatCompleted,
}) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-black border-gray-200 dark:border-[#333333]">
      {/* Image Previews */}
      {imagePreviews && imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative w-16 h-16">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-xl border border-gray-300"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-1 -right-1 bg-black rounded-full p-0.5 shadow-sm hover:bg-gray-900 transition-colors cursor-pointer"
                aria-label={`Remove image ${index + 1}`}
              >
                <FiX className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-1 text-black dark:text-white bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-[#333333] px-4 py-2 shadow-sm focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-[#333333] transition"
      >
        {/* Magic icon (left) */}
        <WiStars className="w-6 h-6 text-gray-600 dark:text-white transition-colors" />

        {/* Input field */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isChatCompleted ? "Chat completed" : "Ask me anything..."
          }
          className="flex-1 border-0 focus:outline-none text-sm px-2 bg-transparent"
          disabled={isLoading || isChatCompleted}
        />

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          multiple
          onChange={handleImageSelect}
          disabled={isLoading || isChatCompleted}
        />

        {/* Attach button */}
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-800 dark:text-white transition-colors"
          disabled={isLoading || isChatCompleted}
        >
          <ImAttachment className="w-4 h-4" />
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading || isChatCompleted}
          className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black p-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiArrowUp className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
