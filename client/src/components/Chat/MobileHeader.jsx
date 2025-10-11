import React, { useEffect, useRef, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/* ==== Custom SVG Icons (use currentColor for theme states) ==== */
function KebabIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="6" r="2" transform="rotate(90 12 6)" fill="currentColor" />
      <circle cx="12" cy="12" r="2" transform="rotate(90 12 12)" fill="currentColor" />
      <path
        d="M12 20C10.8954 20 10 19.1046 10 18C10 16.8954 10.8954 16 12 16C13.1046 16 14 16.8954 14 18C14 19.1046 13.1046 20 12 20Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CopyIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M6 11C6 8.17157 6 6.75736 6.87868 5.87868C7.75736 5 9.17157 5 12 5H15C17.8284 5 19.2426 5 20.1213 5.87868C21 6.75736 21 8.17157 21 11V16C21 18.8284 21 20.2426 20.1213 21.1213C19.2426 22 17.8284 22 15 22H12C9.17157 22 7.75736 22 6.87868 21.1213C6 20.2426 6 18.8284 6 16V11Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M6 19C4.34315 19 3 17.6569 3 16V10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H15C16.6569 2 18 3.34315 18 5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

function HistoryIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 8V12L14.5 14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M18.8622 5.13777C15.042 1.31758 8.86873 1.27889 5.07381 5.07381L6.13447 6.13447C9.33358 2.93536 14.5571 2.95395 17.8016 6.19843L18.8622 5.13777ZM5.13777 18.8622C8.95796 22.6824 15.1313 22.7211 18.9262 18.9262L17.8655 17.8655C14.6664 21.0646 9.44291 21.0461 6.19843 17.8016L5.13777 18.8622ZM18.9262 18.9262C22.7211 15.1313 22.6824 8.95796 18.8622 5.13777L17.8016 6.19843C21.0461 9.44291 21.0646 14.6664 17.8655 17.8655L18.9262 18.9262ZM5.07381 5.07381L3.80743 6.34019L4.86809 7.40085L6.13447 6.13447L5.07381 5.07381ZM4.33399 7.62051L6.87954 7.6333L6.88708 6.13332L4.34153 6.12053L4.33399 7.62051ZM5.08775 6.86675L5.07496 4.3212L3.57498 4.32874L3.58777 6.87429L5.08775 6.86675ZM2.3405 10.5812C1.93907 13.5099 2.87392 16.5984 5.13777 18.8622L6.19843 17.8016C4.27785 15.881 3.48663 13.2652 3.82661 10.7849L2.3405 10.5812Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ==== Component ==== */
export default function MobileHeader({
  onNewChat,
  currentChat,
  previousChats,
  onSelectChat,
  userId,
  onChatsChange,
  startOpenPreviousChats = false,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showPreviousChats, setShowPreviousChats] = useState(false);
  const navigate = useNavigate();

  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

     useEffect(() => {
    if (startOpenPreviousChats) setShowPreviousChats(true);
  }, [startOpenPreviousChats]);

  useEffect(() => {
    const onClickAway = (e) => {
      if (
        showMenu &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
    };
    const onEsc = (e) => e.key === "Escape" && setShowMenu(false);
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onEsc);
    };
  }, [showMenu]);

  const handleCopyTechPack = () => {
    if (currentChat && currentChat.techPack) {
      const techPackText = JSON.stringify(currentChat.techPack, null, 2);
      navigator.clipboard
        .writeText(techPackText)
        .then(() => alert("Tech pack copied to clipboard!"))
        .catch((err) => console.error("Failed to copy: ", err));
    } else {
      alert("No tech pack available to copy");
    }
    setShowMenu(false);
  };

  const handleClose = () => navigate("/dashboard");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  async function handleDeleteChat(e, chatId) {
  e.stopPropagation();
  if (!userId || !chatId) return alert("Missing user or chat ID.");
  const ok = window.confirm("Delete this chat?");
  if (!ok) return;

  try {
    const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/delete-chat`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, chatId }),
    });
    if (!resp.ok) {
      const { error, message } = await resp.json().catch(() => ({}));
      throw new Error(message || error || `Delete failed with ${resp.status}`);
    }
    onChatsChange?.(chatId); // parent updates previousChats
  } catch (err) {
    console.error(err);
    alert(`Could not delete chat: ${err.message}`);
  }
}


  return (
    <>
      {/* Sticky top mobile header */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between p-4 border-b border-gray-200/70 bg-white/90 backdrop-blur dark:bg-black dark:border-[#333333]">
        {/* Brand */}
        <div className="flex items-center">
          <span className="text-lg font-semibold text-[#060A21] dark:text-white">
            Brandgea Lab
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {/* New Chat */}
          <button
            onClick={onNewChat}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#060A21] text-white dark:bg-white dark:text-black text-sm shadow-sm active:scale-[0.98]"
            title="New chat"
          >
            <FiPlus className="w-4 h-4" />
            <span>New</span>
          </button>

          {/* Kebab menu */}
          <div className="relative">
            <button
              ref={menuBtnRef}
              onClick={() => setShowMenu((s) => !s)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-white"
              aria-haspopup="menu"
              aria-expanded={showMenu}
              title="More"
            >
              <KebabIcon className="w-5 h-5" />
            </button>

            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-[#333333] shadow-xl overflow-hidden"
                role="menu"
              >
                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={handleCopyTechPack}
                  role="menuitem"
                >
                  <CopyIcon className="w-4 h-4" />
                  Copy Tech Pack
                </button>

                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => {
                    setShowPreviousChats(true);
                    setShowMenu(false);
                  }}
                  role="menuitem"
                >
                  <HistoryIcon className="w-4 h-4" />
                  Previous Chats
                </button>
              </div>
            )}
          </div>

          {/* Close */}
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-white"
            title="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Previous Chats Bottom Sheet */}
      {showPreviousChats && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/50 dark:bg-white/30  backdrop-blur-[2px]"
          onClick={() => setShowPreviousChats(false)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl bg-white dark:bg-black shadow-2xl border-t border-gray-200/70 dark:border-[#333333] p-4"
            // onClick={() => handleDeleteChat()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-white" />

            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-medium text-[#060A21] dark:text-white">
                Previous Chats
              </h2>
              <button
                onClick={() => setShowPreviousChats(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-white"
                aria-label="Close previous chats"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[58vh] space-y-1.5">
              {previousChats && previousChats.length > 0 ? (
                previousChats.map((chat) => (
                  <button
                    key={chat.chatId || chat._id}
                    className="w-full text-left p-3 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:border-gray-700 transition flex items-start gap-3"
                    onClick={() => {
                      if (onSelectChat) {
                        onSelectChat({ ...chat, chatId: chat.chatId || chat._id });
                        setShowPreviousChats(false);
                      }
                    }}
                  >
                    <HistoryIcon className="w-4 h-4 mt-0.5 text-gray-500 dark:text-white" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[#060A21] dark:text-white">
                        {chat.heading}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(chat.createdAt)}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                  No previous chats
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
