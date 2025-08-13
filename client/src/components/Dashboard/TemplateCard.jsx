import React from 'react'
import { BsArrowRightCircleFill } from 'react-icons/bs'

export default function TemplateCard({ template, onClick }) {
  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer space-y-2
        text-xs sm:text-sm md:text-base
        bg-[#111317] text-[#F0EDFF]
        p-2 sm:p-3 md:p-4
        rounded-lg border border-gray-800
        hover:bg-[#1a1c20] hover:border-gray-700
        hover:shadow-[0_0_25px_6px_rgba(76,49,251,0.2)]
        transition-all duration-200
      "
    >
      {/* Tag */}
      <p
        className="
          text-black
          text-xs sm:text-sm
          bg-blue-100 border border-blue-500
          rounded-xl px-2 py-[2px]
          inline-block
        "
      >
        Ideas
      </p>

      {/* Title & Icon */}
      <div className="flex items-center gap-4 ">
        <p className="font-medium">{template.title}</p>
        <BsArrowRightCircleFill className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>

      {/* Description */}
      <p className="text-[10px] sm:text-xs md:text-sm text-gray-400">
        {template.description}
      </p>
    </div>
  )
}
