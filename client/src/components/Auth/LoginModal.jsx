// src/components/Auth/LoginModal.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiX } from "react-icons/fi";
import GoogleLoginButton from "./GoogleLogin";

export default function LoginModal() {
  const auth = useAuth();

  const { showLoginModal, setShowLoginModal, isLoading } = auth || {};
  const [error, setError] = useState(null);

  const handleClose = () => {
    setShowLoginModal(false);
    setError(null);
  };

  if (!showLoginModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#FCFEFF] to-[#F0EDFF] rounded-2xl p-8 w-full max-w-sm shadow-gray-700 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          disabled={isLoading}
        >
          <FiX className="w-6 h-6" />
        </button>

        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/brandgea-lab.svg"
            alt="Brandgea Logo"
            className="h-12 mb-2"
          />
          <h2 className="text-xl font-semibold text-gray-800">
            Sign in to Brandgea Lab
          </h2>
          <p className="text-gray-500 text-center text-sm mt-1">
            Continue with Google to access instant quote
          </p>
        </div>

        {/*Google Login Button */}
        <div className="flex justify-center mb-6">
          <GoogleLoginButton
            onSuccess={() => {
              setShowLoginModal(false);
            }}
            onError={(msg) => setError(msg)}
          />
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-400">
          By signing in, you agree to our{" "}
          <a href="/terms" className="underline hover:text-gray-600">
            Terms
          </a>{" "}
          &{" "}
          <a href="/privacy" className="underline hover:text-gray-600">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
