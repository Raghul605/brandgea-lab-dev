import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Pencil } from "lucide-react";

/* --- Helpers --- */
const copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {}
};

const avatars = [
  "/avatars/dragon.png",
  "/avatars/space.png",
  "/avatars/cheerful.png",
  "/avatars/galaxy.png",
  "/avatars/warrior.png",
  "/avatars/wizard.png",
  "/avatars/dual.png",
];

export default function Profile() {
  const { user, setUser, login } = useAuth();
  const [selected, setSelected] = useState(user.picture);
  const [editing, setEditing] = useState(false);

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

  // const updateAvatar = async (newPic) => {
  //   try {
  //     const resp = await axios.post(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/auth/update-avatar`,
  //       { picture: newPic },
  //       { withCredentials: true }
  //     );
  //     const updatedUser = resp.data.user;
  //     setSelected(updatedUser.picture);
  //     setUser(updatedUser);
  //     setEditing(false);

  //     // Update AuthContext so header/profile updates instantly
  //     if (resp.data.user) {
  //       login(resp.data.user, localStorage.getItem("sessionToken"));
  //     }
  //   } catch (err) {
  //     console.error("Avatar update failed", err);
  //   }
  // };

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
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-white dark:ring-black shadow"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full grid place-items-center bg-gray-200 dark:bg-[#1a1a1a] ring-2 ring-white dark:ring-black shadow text-gray-700 dark:text-gray-100 text-xl font-semibold">
                  {initials || "U"}
                </div>
              )}

              {/* Edit button */}
              {/* <button
                onClick={() => setEditing((prev) => !prev)}
                className="absolute -bottom-2 right-1 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-full shadow"
                title="Edit avatar"
              >
                <Pencil size={14} />
              </button> */}
            </div>

            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {user.name || "User"}
              </h1>
              {user.email && (
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                  {user.email}
                </div>
              )}
            </div>
          </div>

          {/* Avatar selection grid (only when editing) */}
          {/* {editing && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {avatars.map((a) => (
                <img
                  key={a}
                  src={a}
                  onClick={() => updateAvatar(a)}
                  className={`w-14 h-14 rounded-full cursor-pointer border-2 transition ${
                    selected === a
                      ? "border-blue-500 scale-105"
                      : "border-transparent"
                  }`}
                />
              ))}
            </div>
          )} */}

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-5">
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
              <div className="rounded-lg border border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-black px-3 py-2.5 text-gray-900 dark:text-gray-100">
                {user.email || "—"}
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
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-[#333333] text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#111] transition"
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
