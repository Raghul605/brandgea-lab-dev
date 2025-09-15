import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import LogoutConfirm from "../Auth/LogoutConfirm";
import { useTheme } from "../../context/useTheme";

/* ===================== Custom SVG Icons (currentColor) ===================== */
function MenuIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M4 6H20M4 12H20M4 18H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function BellIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M18.7491 9.70957V9.00497C18.7491 5.13623 15.7274 2 12 2C8.27256 2 5.25087 5.13623 5.25087 9.00497V9.70957C5.25087 10.5552 5.00972 11.3818 4.5578 12.0854L3.45036 13.8095C2.43882 15.3843 3.21105 17.5249 4.97036 18.0229C9.57274 19.3257 14.4273 19.3257 19.0296 18.0229C20.789 17.5249 21.5612 15.3843 20.5496 13.8095L19.4422 12.0854C18.9903 11.3818 18.7491 10.5552 18.7491 9.70957Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M7.5 19C8.15503 20.7478 9.92246 22 12 22C14.0775 22 15.845 20.7478 16.5 19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
function SunIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M12 2V4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 20V22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4 12L2 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M22 12L20 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M19.7778 4.22266L17.5558 6.25424"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4.22217 4.22266L6.44418 6.25424"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.44434 17.5557L4.22211 19.7779"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M19.7778 19.7773L17.5558 17.5551"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function MoonIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M21.0672 11.8568L20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5C8.25 12.5041 11.4959 15.75 15.5 15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L21.0672 11.8568Z"
        fill="currentColor"
      />
      <path
        d="M21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
function ProfileIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle
        cx="12"
        cy="6"
        r="4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
function SignOutIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M9.002 7C9.014 4.825 9.111 3.647 9.879 2.879C10.758 2 12.172 2 15 2H16C18.829 2 20.243 2 21.122 2.879C22 3.757 22 5.172 22 8V16C22 18.828 22 20.243 21.122 21.121C20.243 22 18.829 22 16 22H15C12.172 22 10.758 22 9.879 21.121C9.111 20.353 9.014 19.175 9.002 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M15 12H2M2 12L5.5 9M2 12L5.5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
/* ========================================================================== */

export default function Header({ setSidebarOpen }) {
  const { user, setShowLoginModal, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown on outside click / ESC
  useEffect(() => {
    const onClickAway = (e) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    const onEsc = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen]);

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 dark:bg-black dark:border-[#333333]">
      {/* Left: Hamburger + Brand */}
      <div className="flex items-center">
        <button
          className="text-gray-600 hover:text-gray-900 dark:text-white dark:hover:text-white focus:outline-none lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="ml-2 text-lg sm:hidden font-semibold text-gray-800 dark:text-white">
          Brandgea Lab
        </h1>
      </div>

      {/* Right: Theme → Notifications → "|" → User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme  */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          className="p-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition
             dark:bg-[#333333] dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {theme === "dark" ? (
            <SunIcon className="w-4 h-4 text-gray-700 dark:text-white" />
          ) : (
            <MoonIcon className="w-4 h-4 text-gray-700 dark:text-white" />
          )}
        </button>

        {/* Notifications */}
        {/* <button
          aria-label="Notifications"
          className="relative p-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition
                     dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
          onClick={() => {
            // hook up notifications panel here
          }}
        >
          <BellIcon className="w-4 h-4 text-gray-700 dark:text-gray-100" />
          // Optional unread badge
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-700" />
        </button> */}

        {/* Pipe divider */}
        {/* <span className="mx-1 sm:mx-2 text-gray-300 dark:text-gray-600 select-none">|</span> */}

        {/* User block */}
        {!user ? (
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-95 transition-colors"
          >
            Login
          </button>
        ) : (
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setMenuOpen((s) => !s)}
              className="flex items-center gap-2 transition"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title="User menu"
            >
              {/* Avatar with ONLINE dot */}
              <div className="relative">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-700 grid place-items-center ring-1 ring-black/5 dark:ring-white/10">
                    <ProfileIcon className="w-4 h-4 text-white" />
                  </div>
                )}
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"
                  title="Online"
                  aria-label="Online"
                />
              </div>

              {/* Caret */}
              <svg
                viewBox="0 0 24 24"
                className={`w-4 h-4 text-gray-600 dark:text-gray-200 transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              >
                <path
                  d="M6 9l6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-56 rounded-2xl  bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-gray-900 z-50 overflow-hidden"
                role="menu"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-[#333333]">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-300 truncate">
                    {user.email || ""}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <ProfileIcon className="w-4 h-4" />
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                    role="menuitem"
                  >
                    <SignOutIcon className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm logout */}
      <LogoutConfirm
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </header>
  );
}
