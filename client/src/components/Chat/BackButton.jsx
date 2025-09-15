import React from 'react';
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 px-3 py-3 text-gray-700 dark:text-white bg-white dark:bg-black rounded-lg border border-gray-300 dark:border-[#333333] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <HiOutlineArrowLeft className="w-4 h-4" />
      
    </button>
  );
}