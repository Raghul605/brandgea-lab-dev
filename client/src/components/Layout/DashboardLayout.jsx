import React, { useState} from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../context/useTheme";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isInitialized } = useTheme();

  // Hide sidebar on history page
  const isChatPage = location.pathname === "/chat";
  const isHistoryPage = location.pathname === "/history";
  const isSpecialPage = isChatPage || isHistoryPage;

  // Wait for theme initialization to prevent flash of wrong theme
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      {/* Sidebar - hidden on history page and on mobile for chat/history */}
      {!isHistoryPage && (
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Hide main header on mobile for chat/history pages */}
        <div className={isSpecialPage ? "hidden md:block" : ""}>
          <Header setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Page content - remove padding on mobile for chat/history pages */}
        <main
          className={`flex-1 overflow-y-auto ${
            isSpecialPage ? "p-0" : "p-4 md:p-6"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
