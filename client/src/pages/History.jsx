import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import WelcomeScreen from "../components/Chat/WelcomeScreen";
import MobileHeader from "../components/Chat/MobileHeader";
import { useNavigate } from "react-router-dom";
import Message from "../components/Chat/Message";
import Sidebar from "../components/Chat/ChatHistorySidebar";
import { FiCopy } from "react-icons/fi";
import { BsStars } from "react-icons/bs";
import BackButton from "../components/Chat/BackButton";

const stringifyFinal = (msg) => {
  const tp = msg?.techPack || msg?.gptResponse?.tech_pack;
  const mc = msg?.manufacturingCosts || msg?.gptResponse?.manufacturing_costs;

  if (!tp && !mc) return msg?.content ?? "";

  const lines = [];
  if (tp) {
    lines.push("Tech Pack:");
    if (tp.garment_type) lines.push(`- Garment Type: ${tp.garment_type}`);
    if (tp.material) lines.push(`- Material: ${tp.material}`);
    if (tp.gsm) lines.push(`- GSM: ${tp.gsm}`);
    if (tp.tech) lines.push(`- Technology: ${tp.tech}`);
    if (Array.isArray(tp.design) && tp.design.length) {
      lines.push(
        `- Design: ${tp.design
          .map((d) => `${d?.placement || "—"} • ${d?.type || "—"}`)
          .join(", ")}`
      );
    }
    if (Array.isArray(tp.color) && tp.color.length) {
      lines.push(`- Colors: ${tp.color.join(", ")}`);
    }
    if (Array.isArray(tp.wash_treatments) && tp.wash_treatments.length) {
      lines.push(`- Wash Treatments: ${tp.wash_treatments.join(", ")}`);
    }
    if (tp.additional_comments) {
      lines.push(`- Comments: ${tp.additional_comments}`);
    }
  }

  return lines.join("\n");
};

export default function History() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const messageContainerRef = useRef(null);
  const userId = user?._id || user?.id;

  useEffect(() => {
    if (user && token) {
      fetchChats();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/previous-chats/${
          user.id
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChats(response.data.chats || []);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadChat = async (chatId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/open-chat/${
          user.id
        }/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const chat = response.data.chat;

      // Transform messages to the format expected by ChatArea
      let lastUserImages = [];
      const transformedMessages = chat.messages.map((msg, index) => {
        let content = "";
        let type = "user";
        const rawImageUrls = Array.isArray(msg?.content?.imageUrls)
          ? msg.content.imageUrls
          : [];

        let imageUrls = [];

        if (msg.sender === "user") {
          // capture text
          content = msg.content.text || "";
          // remember the last user images for later (final AI message), but DO NOT display on user bubbles here
          if (rawImageUrls?.length) lastUserImages = rawImageUrls.slice();
        } else if (msg.sender === "gpt") {
          // classify gpt message
          if (msg.content.question) {
            content = msg.content.question;
            type = "question";
          } else if (msg.content.tech_pack) {
            content = "Here's your tech pack summary:";
            type = "final";
          } else if (msg.content.summary) {
            content = msg.content.summary;
            type = "summary";
          } else {
            content = JSON.stringify(msg.content);
            type = "info";
          }

          // Only show images on the FINAL AI message
          const isFinalLike =
            type === "final" ||
            msg.isFinal === true ||
            !!msg.content?.tech_pack;

          if (isFinalLike) {
            // Prefer AI-provided images if present, else fallback to last user images
            imageUrls =
              (Array.isArray(msg?.content?.imageUrls) &&
                msg.content.imageUrls.length > 0 &&
                msg.content.imageUrls) ||
              lastUserImages ||
              [];
          }
        }

        return {
          id: msg._id || `${chat._id}-${index}`,
          role: msg.sender === "user" ? "user" : "ai",
          content: content,
          timestamp: new Date(msg.timestamp),
          type: type,
          techPack: msg.content.tech_pack,
          manufacturingCosts: msg.content.manufacturing_costs,
          isCompleted: msg.isFinal,
          imageUrls,
          chatId: chat._id,
          Payments_For_ManufacturerFind: chat?.Payments_For_ManufacturerFind === true,
        };
      });

      setSelectedChat(chat);
      setChats((prevChats) =>
        prevChats.map((c) =>
          c.chatId === chatId ? { ...c, heading: chat.heading } : c
        )
      );
      setMessages(transformedMessages);
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const handleNewChat = () => {
    setSelectedChat(null);
    setMessages([]);
    navigate("/dashboard");
  };

  const getLatestSummaryText = useCallback(() => {
    if (!messages?.length) return "";

    const explicit = [...messages]
      .reverse()
      .find(
        (m) =>
          m?.type === "summary" ||
          m?.gptResponse?.summary ||
          (typeof m?.content === "string" &&
            m?.content?.trim() &&
            m?.role === "ai")
      );
    if (explicit?.gptResponse?.summary)
      return String(explicit.gptResponse.summary);
    if (explicit?.type === "summary") return String(explicit.content ?? "");

    const finalMsg = [...messages]
      .reverse()
      .find(
        (m) =>
          m?.type === "final" ||
          m?.techPack ||
          m?.gptResponse?.tech_pack ||
          m?.manufacturingCosts ||
          m?.gptResponse?.manufacturing_costs
      );
    if (finalMsg) return stringifyFinal(finalMsg);

    const lastAi = [...messages]
      .reverse()
      .find((m) => m.role === "ai" && m.content);
    return String(lastAi?.content ?? "");
  }, [messages]);

  const handleCopySummary = useCallback(async () => {
    try {
      const text = getLatestSummaryText();
      if (!text) {
        // optional: plug into your toast system if you want feedback
        console.info("No summary to copy.");
        return;
      }
      await navigator.clipboard.writeText(text);
      console.info("Summary copied!");
    } catch (e) {
      console.error("Copy failed:", e);
    }
  }, [getLatestSummaryText]);

  const handleChatsChange = (deletedChatId) => {
    setChats((prev) =>
      prev.filter((c) => (c.chatId || c._id) !== deletedChatId)
    );
    // Optional: if the currently open chat was deleted, reset the right pane
    if (selectedChat && String(selectedChat._id) === String(deletedChatId)) {
      setSelectedChat(null);
      setMessages([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to view your chat history
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const TopBar = () => (
    <div className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 dark:bg-black dark:border-[#333333] backdrop-blur supports-[backdrop-filter]:bg-white/50 hidden sm:block">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-3 sm:px-4 py-2">
        <div className="flex items-center gap-2">
          <BackButton />
          <h2 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white">
            AI Product Analyser
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition"
            title="Copy latest summary"
          >
            <FiCopy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-black overflow-hidden">
      <MobileHeader
        onNewChat={handleNewChat}
        onClose={() => navigate("/dashboard")}
        previousChats={chats}
        userId={userId}
        onChatsChange={handleChatsChange}
        onSelectChat={(chat) => loadChat(chat.chatId || chat._id)}
        currentChat={{ techPack: messages.find((m) => m.techPack)?.techPack }}
      />

      <div className="flex flex-1 min-h-0">
        {/* Use the Sidebar component */}
        <div className="hidden md:block w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-[#333333] min-h-0 overflow-hidden ">
          <Sidebar
            previousChats={chats}
            onNewChat={handleNewChat}
            onSelectChat={(chat) => loadChat(chat.chatId || chat._id)}
            userId={userId}
            onChatsChange={handleChatsChange}
          />
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0">
          <TopBar />
          {selectedChat ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages area */}
              <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto p-2 sm:p-4 sidebar-scroll"
                style={{ scrollbarGutter: "stable both-edges" }}
              >
                {messages.map((message) => (
                  <Message key={message.id} message={message} isHistory />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <WelcomeScreen onCreateNewChat={handleNewChat} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
