import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";


function BagIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M3.794 12.029c.537-2.686.806-4.029 1.693-4.894A5.1 5.1 0 0 1 6.018 6.7C7.04 6 8.41 6 11.149 6h1.703c2.739 0 4.108 0 5.13.701.189.13.366.275.53.434.887.865 1.156 2.208 1.693 4.894.771 3.856 1.157 5.784.269 7.15-.16.247-.347.476-.558.682C18.75 21 16.784 21 12.851 21h-1.703c-3.933 0-5.9 0-7.065-1.138a3 3 0 0 1-.56-.682c-.887-1.366-.502-3.294.371-7.151Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 6V5a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9.171 15c.412 1.165 1.523 2 2.829 2s2.418-.835 2.83-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function ChatLineIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {/* Outer chat bubble — outline only */}
      <path
        d="M13.5 2.75c1.651 0 2.837 0 3.762.088.914.086 1.496.252 1.959.536.468.287.98.799 1.247 1.33.453.739.655 1.577.752 2.6.096 1.012.097 2.281.097 4.204 0 2.7-.003 3.94-.262 4.97-.273 1.084-.837 2.024-1.708 2.895-1.364 1.364-3.33 2.03-7.263 2.03-3.934 0-5.9-.666-7.065-1.805-.871-.871-1.435-1.81-1.708-2.895-.26-1.03-.262-2.271-.262-4.97 0-1.923.001-3.192.097-4.204.097-1.023.299-1.861.752-2.6.267-.531.779-1.043 1.247-1.33.463-.284 1.045-.45 1.959-.536C7.163 2.75 8.349 2.75 10 2.75H13.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Text lines */}
      <path d="M8 9h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 12.5h5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HistoryIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.862 5.138C15.042 1.318 8.869 1.279 5.074 5.074L6.134 6.134C9.334 2.935 14.557 2.954 17.802 6.198l1.06-1.06ZM5.138 18.862c3.82 3.82 9.993 3.859 13.788.064l-1.06-1.06c-3.199 3.199-8.422 3.181-11.667-.064L5.138 18.862Zm13.788.064c3.795-3.795 3.756-9.968-.064-13.788l-1.06 1.06c3.245 3.245 3.263 8.468.064 11.667l1.06 1.06ZM5.074 5.074 3.807 6.34l1.06 1.061L6.134 6.134 5.074 5.074Zm-.74 2.547 2.545.013.008-1.5-2.546-.013-.007 1.5Zm.754-.754-.013-2.546-1.5.008.012 2.546 1.5-.008ZM2.34 10.581c-.402 2.929.533 6.017 2.797 8.281l1.061-1.06C4.278 15.881 3.487 13.265 3.827 10.785l-1.486-.204Z" fill="currentColor"/>
    </svg>
  );
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: "Chat With AI", href: "/dashboard", Icon: ChatLineIcon },
    ...(user
      ? [
          { name: "Chat History", href: "/history", Icon: HistoryIcon },
          { name: "Orders", href: "/orders", Icon: BagIcon },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-900/70 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#F6F6F6] dark:bg-black border-r border-gray-200 dark:border-[#333333] transform transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between h-16 px-4 ">
          <span className="text-xl font-semibold text-gray-800 dark:text-white">
            Brandgea Lab
          </span>
          <button
            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map(({ name, href, Icon }) => {
              const isActive = location.pathname === href;
              const base =
                "flex items-center px-4 py-3 text-sm rounded-lg transition-colors";
              const active =
                "bg-white text-[#060A21] dark:bg-[#333333] dark:text-white";
              const idle =
                "text-gray-700 hover:bg-[#EEEDEE] dark:text-white dark:hover:bg-[#242424]";

              return (
                <Link
                  key={name}
                  to={href}
                  className={`${base} ${isActive ? active : idle}`}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
