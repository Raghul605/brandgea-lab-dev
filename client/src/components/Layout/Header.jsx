import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
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

      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {user.picture && !imageError ? (
              <img 
                src={user.picture} 
                alt={user.name} 
                className="aspect-square w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-300 object-cover"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="aspect-square w-8 h-8 md:w-10 md:h-10 bg-gray-700 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white text-md md:text-lg font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
            title="Logout"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="text-sm hidden md:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}