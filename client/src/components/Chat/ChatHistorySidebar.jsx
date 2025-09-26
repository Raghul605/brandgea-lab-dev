import React from "react";
import { BsStars } from "react-icons/bs";
import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ChatHistorySidebar({ previousChats, onNewChat, onSelectChat,userId, onChatsChange }) {
  const navigate = useNavigate();

  // Format the date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  async function handleDeleteChat(e, chatId) {
    e.stopPropagation();
    if (!userId || !chatId) return alert(`Missing ID → userId: ${userId}, chatId: ${chatId}`);
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
      // tell parent to remove it from previousChats
      onChatsChange?.(chatId);
    } catch (err) {
      console.error(err);
      alert(`Could not delete chat: ${err.message}`);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-gray-200 dark:border-[#333333]">
        {/* <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333333] mb-2"
        >
          <FiArrowLeft className="w-5 h-5 text-black dark:text-white" />
        </button> */}

        <button
          onClick={onNewChat}
          className="hidden sm:flex items-center justify-center gap-2 px-3 py-2 bg-[#060A21] dark:bg-white text-white dark:text-black rounded-full w-full text-sm font-medium transition-all cursor-pointer active:scale-105"
        >
          New Chat
          <BsStars className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 sidebar-scroll"
      style={{ scrollbarGutter: "stable both-edges" }}>
        <h3 className="text-sm text-gray-700 dark:text-gray-400 mb-3">Previous Chats</h3>
        <div className="space-y-2">
          {previousChats && previousChats.length > 0 ? (
            previousChats.map((chat) => {
              const id = chat.chatId || chat._id; 
              return (
                <div
                  key={id}
                  className="flex items-center justify-between p-3 rounded-lg dark:hover:bg-[#242424] hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    const id = chat.chatId || chat._id;
                    onSelectChat({ ...chat, chatId: id });
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm text-gray-900 dark:text-white">
                      {chat.heading}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(chat.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(e, id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No previous chats
            </p>
          )}
        </div>
      </div>
    </div>
  );
}