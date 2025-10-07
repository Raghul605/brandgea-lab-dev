// src/components/Auth/LoginModal.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiX } from "react-icons/fi";
import GoogleLoginButton from "./GoogleLogin";
import ToastNotification from "../UI/ToastNotification";

export default function LoginModal() {
  const auth = useAuth();

  const { showLoginModal, setShowLoginModal, isLoading } = auth || {};
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({show: false, message: "", type: ""});

  const handleClose = () => {
    setShowLoginModal(false);
    setError(null);
  };

  useEffect(() => {
    if(error) {
      setToast({show: true, message:error, type:"error"});
            const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      });
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!showLoginModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
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
          clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
            onSuccess={() => {
              setShowLoginModal(false);
            }}
            onError={(msg) => setError(msg)}
          />
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-400">
          By signing in, you agree to our{" "}
          <a
            href="https://brandgea.com/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
            onClick={handleClose}
          >
            Terms
          </a>{" "}
          &{" "}
          <a
            href="https://brandgea.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
            onClick={handleClose}
          >
            Privacy Policy
          </a>
        </p>
      </div>

            {/* Toast Notification */}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />
    </div>
  );
}
