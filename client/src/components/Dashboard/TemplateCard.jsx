import React from "react";
import { BsArrowRightCircleFill } from "react-icons/bs";

export default function TemplateCard({ template, onClick }) {
  const handleKey = (e) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Use template: ${template.title}`}
      onClick={onClick}
      onKeyDown={handleKey}
      className="
        group cursor-pointer select-none h-full
        rounded-2xl border bg-white p-4 shadow-sm
        border-gray-200 hover:bg-gray-50 hover:shadow-md
        transition-all duration-150
        dark:bg-black/90 dark:border-[#333333] dark:hover:bg-[#1D1D1D]
      "
    >
      {/* Tag */}
      <span
        className="
          inline-flex items-center px-2.5 py-0.5 rounded-full
          text-xs font-medium
          text-gray-700 bg-blue-100 border border-blue-200
          dark:text-black dark:bg-blue-200 dark:border-blue-200
        "
      >
        Ideas
      </span>

      {/* Title + arrow */}
      <div className="mt-2.5 flex items-center justify-between gap-3">
        <p className="text-sm sm:text-base text-[#060A21] dark:text-gray-100">
          {template.title}
        </p>
        <BsArrowRightCircleFill
          className="
            shrink-0 w-4 h-4 sm:w-5 sm:h-5
            text-gray-400 transition-all
            group-hover:text-[#060A21] dark:group-hover:text-white
            group-hover:translate-x-0.5
          "
        />
      </div>

      {/* Description */}
      <p className="mt-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        {template.description}
      </p>
    </div>
  );
}
