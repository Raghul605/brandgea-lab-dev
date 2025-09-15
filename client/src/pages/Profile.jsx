import React from "react";
import { useAuth } from "../context/AuthContext";

/* --- Helpers --- */
const copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {}
};

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div>
        <div className="rounded-xl border border-gray-200 dark:border-[#333333] p-6 text-center bg-white dark:bg-black">
          <p className="text-gray-700 dark:text-gray-200">
            Please sign in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const avatar = user.picture || "/default-avatar.png";
  const initials =
    !user.picture && user?.name
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : null;

  return (
    <div>
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-black p-4 sm:p-6">
          {/* Header: avatar + name */}
          <div className="flex items-center gap-4 sm:gap-5 mb-4 sm:mb-6">
            <div className="relative shrink-0">
              {user.picture ? (
                <img
                  src={avatar}
                  alt={user.name || "User"}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-white dark:ring-black shadow"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl grid place-items-center bg-gray-200 dark:bg-[#1a1a1a] ring-2 ring-white dark:ring-black shadow text-gray-700 dark:text-gray-100 text-xl font-semibold">
                  {initials || "U"}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {user.name || "User"}
              </h1>

              {user.email ? (
                <div className="mt-1 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="truncate">{user.email}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Full name
              </label>
              <div className="rounded-lg border border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-black px-3 py-2.5 text-gray-900 dark:text-gray-100">
                {user.name || "—"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Email
              </label>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-black px-3 py-2.5">
                <span className="truncate text-gray-900 dark:text-gray-100">
                  {user.email || "—"}
                </span>
                {user.email && (
                  <button
                    onClick={() => copy(user.email)}
                    className="px-2 py-1 rounded-md border border-gray-200 dark:border-[#333333] hover:bg-white dark:hover:bg-[#111] text-xs"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Mobile
              </label>
              <div className="rounded-lg border border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-black px-3 py-2.5 text-gray-900 dark:text-gray-100">
                {user.mobile || "—"}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm dark:bg-white dark:text-black hover:opacity-95"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Open Chat
            </button>
            <button
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-[#333333] text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#111]"
              onClick={() => (window.location.href = "/orders")}
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
