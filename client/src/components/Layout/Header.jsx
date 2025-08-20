import { FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function Header() {
  const { user, logout, setShowLoginModal } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <header className="shadow-sm py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white">Brandgea Lab</h1>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black shadow-md cursor-pointer">
          <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
          BETA
        </span>
      </div>

      {user ? (
        <div className="flex items-center gap-4 relative">
          <div className="flex items-center gap-2">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full border-2 border-gray-300 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border-1 border-gray-300">
                <FiUser className="text-white w-4 h-4" />
              </div>
            )}
            <span className="text-sm text-white hidden md:inline max-w-[80px] truncate">
              {user.name.split(" ")[0]}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
            title="Logout"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="text-sm hidden md:inline">Logout</span>
          </button>

          {/* Fullscreen Modal for Logout Confirmation */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50">
              <div className="bg-gradient-to-br from-[#FCFEFF] to-[#F0EDFF] rounded-2xl shadow-gray-700 shadow-2xl px-6 pt-4 pb-6 w-80 max-w-[90%]">
                <h3 className="text-red-700 font-semibold text-lg text-center">Logout</h3>
                <p className="text-gray-800 mb-4 text-md  text-center">
                  Are you sure you want to logout?
                </p>
                <div className="flex justify-between gap-2">
                  <button
                    onClick={cancelLogout}
                    className="px-4 py-2 font-medium text-gray-600 border border-gray-400 rounded-md hover:border-gray-500 hover:text-black hover:bg-gray-100 transition-colors w-full"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="px-4 py-2 font-medium text-white bg-black hover:bg-gray-800 rounded-md transition-colors w-full"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowLoginModal(true)}
          className="text-sm font-medium text-white border border-white px-4 py-1.5 rounded-lg hover:bg-white hover:text-black transition-colors"
        >
          Login
        </button>
      )}
    </header>
  );
}
