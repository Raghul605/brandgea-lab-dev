// // src/pages/ChatPage.jsx
// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import useFileUpload from "../hooks/useFileUpload";
// import { generateUniqueId, showToast } from "../utils/helpers";
// import QuoteResultDialog from "../components/Dashboard/QuoteResultDialog";
// import ToastNotification from "../components/UI/ToastNotification";
// import ChatArea from "../components/Chat/ChatArea";
// import Sidebar from "../components/Chat/ChatHistorySidebar";
// import MobileHeader from "../components/Chat/MobileHeader";
// import { BsStars } from "react-icons/bs";
// import axios from "axios";
// import { FiCopy } from "react-icons/fi";
// import BackButton from "../components/Chat/BackButton";

// const stringifyFinal = (msg) => {
//   const tp = msg?.techPack || msg?.gptResponse?.tech_pack;
//   const mc = msg?.manufacturingCosts || msg?.gptResponse?.manufacturing_costs;

//   if (!tp && !mc) return msg?.content ?? "";

//   const lines = [];
//   if (tp) {
//     lines.push("Tech Pack:");
//     if (tp.garment_type) lines.push(`- Garment Type: ${tp.garment_type}`);
//     if (tp.material) lines.push(`- Material: ${tp.material}`);
//     if (tp.gsm) lines.push(`- GSM: ${tp.gsm}`);
//     if (tp.tech) lines.push(`- Technology: ${tp.tech}`);
//     if (Array.isArray(tp.design) && tp.design.length) {
//       lines.push(
//         `- Design: ${tp.design
//           .map((d) => `${d?.placement || "—"} • ${d?.type || "—"}`)
//           .join(", ")}`
//       );
//     }
//     if (Array.isArray(tp.color) && tp.color.length) {
//       lines.push(`- Colors: ${tp.color.join(", ")}`);
//     }
//     if (Array.isArray(tp.wash_treatments) && tp.wash_treatments.length) {
//       lines.push(`- Wash Treatments: ${tp.wash_treatments.join(", ")}`);
//     }
//     if (tp.additional_comments) {
//       lines.push(`- Comments: ${tp.additional_comments}`);
//     }
//   }

//   return lines.join("\n");
// };

// export default function ChatPage() {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [previousChats, setPreviousChats] = useState([]);
//   const [currentChatId, setCurrentChatId] = useState(null);
//   const [quoteData, setQuoteData] = useState(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isChatCompleted, setIsChatCompleted] = useState(false);
//   const [toast, setToast] = useState({ show: false, message: "", type: "" });

//   const {
//     files: chatImages,
//     previews: imagePreviews,
//     handleFileSelect: handleImageSelect,
//     handleRemoveFile: handleRemoveImage,
//     resetFiles: resetChatImages,
//   } = useFileUpload();

//   const chatContainerRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, token } = useAuth();
//   const initRef = useRef(false);
//   const sendingRef = useRef(false);

//   const updateChatHeading = useCallback(
//     async (chatId, newHeading) => {
//       try {
//         await axios.patch(
//           `${
//             import.meta.env.VITE_BACKEND_URL
//           }/api/chat/update-heading/${chatId}`,
//           { heading: newHeading },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         // update the local state if needed
//         setPreviousChats((prevChats) =>
//           prevChats.map((chat) =>
//             chat.chatId === chatId ? { ...chat, heading: newHeading } : chat
//           )
//         );
//       } catch (error) {
//         console.error("Error updating chat heading:", error);
//       }
//     },
//     [token, setPreviousChats]
//   );

//   const processAIResponse = useCallback(
//     (data, chatId) => {
//       let aiMessageContent = "";
//       let messageType = "info";
//       let techPack = null;
//       let manufacturingCosts = null;
//       let isCompleted = false;

//       const newHeading =
//         (data?.gptResponse?.heading &&
//           String(data.gptResponse.heading).trim()) ||
//         (data?.heading && String(data.heading).trim()) ||
//         null;

//       const images = data.imageUrls || [];

//       if (data?.gptResponse) {
//         const gptResponse = data.gptResponse;

//         if (gptResponse.summary) {
//           aiMessageContent = String(gptResponse.summary);
//           messageType = "summary"; // show confirm UI
//         } else if (gptResponse.question) {
//           aiMessageContent = String(gptResponse.question);
//           messageType = "question";
//         } else if (gptResponse.tech_pack) {
//           techPack = gptResponse.tech_pack;
//           manufacturingCosts =
//             data.manufacturing_costs || gptResponse.manufacturing_costs;
//           isCompleted = Boolean(data.isCompleted);
//           aiMessageContent = "Product analysis is ready.";
//           messageType = "final";
//         }
//       } else if (data?.tech_pack) {
//         techPack = data.tech_pack;
//         manufacturingCosts = data.manufacturing_costs;
//         isCompleted = Boolean(data.isCompleted);
//         aiMessageContent = "Product analysis is ready.";
//         messageType = "final";
//       } else {
//         aiMessageContent = data?.message || "I've processed your request.";
//         messageType = "info";
//       }

//       const aiMessage = {
//         id: generateUniqueId(),
//         role: "ai",
//         content: aiMessageContent,
//         timestamp: new Date(),
//         type: messageType,
//         techPack,
//         manufacturingCosts,
//         isCompleted,
//         imageUrls: images,
//         gptResponse: data?.gptResponse,
//         chatId,
//       };

//       setMessages((prev) => [...prev, aiMessage]);

//       if (data.isCompleted) setIsChatCompleted(true);
//       if (newHeading) updateChatHeading(chatId, newHeading);

//       resetChatImages();
//     },
//     [resetChatImages, updateChatHeading]
//   );

//   const sendMessageToAI = useCallback(
//     async (
//       messageText,
//       chatId = currentChatId,
//       country = user.country || "India"
//     ) => {
//       if (!chatId || !user || !token) {
//         console.error("Missing required parameters:", { chatId, user, token });
//         return;
//       }
//       if (sendingRef.current) return; // avoid duplicates
//       sendingRef.current = true;
//       setIsLoading(true);

//       try {
//         const formData = new FormData();
//         formData.append("prompt", messageText);
//         formData.append("country", country);
//         formData.append("chatId", chatId);
//         formData.append("userId", user.id);
//         if (messageText === "__ACTION__:CONFIRM_TECH_PACK") {
//           formData.append("action", "confirm_tech_pack");
//         }

//         chatImages.forEach((image) => formData.append("images", image));

//         if (location.state?.productImages) {
//           location.state.productImages.forEach((image) => {
//             formData.append("images", image);
//           });
//         }

//         const response = await axios.post(
//           `${import.meta.env.VITE_BACKEND_URL}/api/clothing/validate`,
//           formData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         processAIResponse(response.data, chatId);
//       } catch (error) {
//         const status = error?.response?.status;
//         const data = error?.response?.data;
//         console.error("Error sending message to AI:", status, data, error);
//         const msg =
//           data?.error ||
//           data?.message ||
//           `Request failed${status ? ` (HTTP ${status})` : ""}`;
//         showToast(setToast, msg, "error");

//         setMessages((prev) => [
//           ...prev,
//           {
//             id: generateUniqueId(),
//             role: "ai",
//             content:
//               "Sorry, there was an error processing your request. Please try again.",
//             timestamp: new Date(),
//             type: "error",
//           },
//         ]);
//       } finally {
//         setIsLoading(false);
//         sendingRef.current = false;
//       }
//     },
//     [currentChatId, user, token, chatImages, location.state, processAIResponse]
//   );


//   const processIncomingChat = useCallback(() => {
//     if (
//       location.state?.inputText &&
//       location.state?.chatId &&
//       location.state?.country &&
//       messages.length === 0
//     ) {
//       setCurrentChatId(location.state.chatId);

//       const initialMessage = {
//         id: generateUniqueId(),
//         role: "user",
//         content: location.state.inputText,
//         timestamp: new Date(),
//         imageUrls: location.state.productImages
//           ? location.state.productImages.map((img) => URL.createObjectURL(img))
//           : [],
//       };

//       setMessages([initialMessage]);
//       sendMessageToAI(
//         location.state.inputText,
//         location.state.chatId,
//         location.state.country
//       );
//     }
//   }, [
//     location.state,
//     messages.length,
//     setCurrentChatId,
//     setMessages,
//     sendMessageToAI,
//   ]);

//   const createNewChat = useCallback(async () => {
//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/chat/new-chat`,
//         { userId: user.id },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setCurrentChatId(response.data.chatId);
//       setMessages([]);
//       setInputText("");
//       resetChatImages();
//       setIsChatCompleted(false);
//     } catch (error) {
//       console.error("Error creating new chat:", error);
//     }
//   }, [
//     user,
//     token,
//     setCurrentChatId,
//     setMessages,
//     setInputText,
//     resetChatImages,
//     setIsChatCompleted,
//   ]);


//   useEffect(() => {
//     if (!user || !token) return;
//     if (initRef.current) return;
//     initRef.current = true;

//     const hasIncomingChat = !!location.state?.chatId;
//     if (hasIncomingChat && messages.length === 0) {
//       processIncomingChat();
//     } else if (!hasIncomingChat && !currentChatId) {
//       createNewChat();
//     }
//   }, [
//     user,
//     token,
//     location.state,
//     messages.length,
//     currentChatId,
//     processIncomingChat,
//     createNewChat,
//   ]);

//   // fetch previous chats for MobileHeader bottom sheet
//   useEffect(() => {
//     if (!user || !token) return;
//     (async () => {
//       try {
//         const res = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/api/chat/previous-chats/${
//             user.id
//           }`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setPreviousChats(res.data.chats || []);
//       } catch (e) {
//         console.error("Failed to fetch previous chats:", e);
//       }
//     })();
//   }, [user, token]);

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop =
//         chatContainerRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputText.trim() || isLoading) return;

//     const newMessage = {
//       id: generateUniqueId(),
//       role: "user",
//       content: inputText,
//       timestamp: new Date(),
//       imageUrls: imagePreviews || [],
//     };

//     setMessages((prev) => [...prev, newMessage]);
//     setInputText("");

//     await sendMessageToAI(inputText);
//   };

//   const handleGenerateQuote = async (response) => {
//     const confirmUserMsg = {
//       id: Date.now(),
//       role : "user",
//       content: response === "yes" ? "Yes, please generate the quote" : "I need to make some changes"
//     }
//   }

//   // const handleGenerateQuote = async (response) => {
//   //   const messageContent =
//   //     response === "yes"
//   //       ? "Yes, please generate the quote"
//   //       : "I need to make some changes";

//   //   const confirmMessage = {
//   //     id: Date.now(),
//   //     role: "user",
//   //     content: messageContent,
//   //     timestamp: new Date(),
//   //   };

//   //   setMessages((prev) => [...prev, confirmMessage]);

//   //   if (response === "yes") {
//   //     await sendMessageToAI("Yes, please generate the quote");
//   //   } else {
//   //     const aiMessage = {
//   //       id: Date.now() + 1,
//   //       role: "ai",
//   //       content: "What changes would you like to make?",
//   //       timestamp: new Date(),
//   //       type: "question",
//   //     };

//   //     setMessages((prev) => [...prev, aiMessage]);
//   //   }
//   // };

//   const handleNewChat = () => {
//     navigate("/dashboard", { replace: true });
//   };

//   const loadChat = async (chatId) => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/chat/open-chat/${
//           user.id
//         }/${chatId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const chat = response.data.chat;
//       const transformedMessages = chat.messages.map((msg, index) => {
//         const role = msg.sender === "user" ? "user" : "ai";
//         let content = "";

//         if (msg.sender === "user") {
//           content = msg.content.text || "";
//         } else if (msg.sender === "gpt") {
//           if (msg.content.question) {
//             content = msg.content.question;
//           } else if (msg.content.tech_pack) {
//             content = "Here's your tech pack summary:";
//           } else {
//             content = JSON.stringify(msg.content);
//           }
//         }

//         return {
//           id: msg._id || generateUniqueId(),
//           role,
//           content,
//           timestamp: new Date(msg.timestamp),
//           type:
//             msg.sender === "gpt"
//               ? msg.content.tech_pack
//                 ? "summary"
//                 : "question"
//               : "user",
//           techPack: msg.content.tech_pack,
//           manufacturingCosts: msg.content.manufacturing_costs,
//           isCompleted: msg.isFinal,
//           imageUrls: msg.content.imageUrls || [],
//         };
//       });

//       setCurrentChatId(chatId);
//       setMessages(transformedMessages);
//       setIsChatCompleted(chat.isCompleted);

//       if (chat.isCompleted) {
//         setQuoteData({
//           pricing: chat.manufacturing_costs,
//           techPack: transformedMessages.find((m) => m.techPack)?.techPack,
//           chatId: chatId,
//         });
//       }
//     } catch (error) {
//       console.error("Error loading chat:", error);
//       showToast(setToast, "Failed to load chat", "error");
//     }
//   };

//   const getLatestSummaryText = useCallback(() => {
//     if (!messages?.length) return "";

//     // 1) prefer explicit summary messages
//     const explicit = [...messages]
//       .reverse()
//       .find(
//         (m) =>
//           m?.type === "summary" ||
//           m?.gptResponse?.summary ||
//           (typeof m?.content === "string" &&
//             m?.content?.trim() &&
//             m?.role === "ai")
//       );
//     if (explicit?.gptResponse?.summary)
//       return String(explicit.gptResponse.summary);
//     if (explicit?.type === "summary") return String(explicit.content ?? "");

//     // 2) then prefer latest final analysis (tech pack + costs)
//     const finalMsg = [...messages]
//       .reverse()
//       .find(
//         (m) =>
//           m?.type === "final" ||
//           m?.techPack ||
//           m?.gptResponse?.tech_pack ||
//           m?.manufacturingCosts ||
//           m?.gptResponse?.manufacturing_costs
//       );
//     if (finalMsg) return stringifyFinal(finalMsg);

//     // 3) fallback: last AI message text
//     const lastAi = [...messages]
//       .reverse()
//       .find((m) => m.role === "ai" && m.content);
//     return String(lastAi?.content ?? "");
//   }, [messages]);

//   const handleCopySummary = useCallback(async () => {
//     try {
//       const text = getLatestSummaryText();
//       if (!text) {
//         showToast(setToast, "No summary to copy yet.", "info");
//         return;
//       }
//       await navigator.clipboard.writeText(text);
//       showToast(setToast, "Summary copied!", "success");
//     } catch (e) {
//       console.error("Copy failed:", e);
//       showToast(setToast, "Couldn’t copy summary", "error");
//     }
//   }, [getLatestSummaryText, setToast]);
//   return (
//     <div className="h-screen flex flex-col">
//       <MobileHeader
//         onNewChat={handleNewChat}
//         currentChat={{ techPack: messages.find((m) => m.techPack)?.techPack }}
//         previousChats={previousChats}
//         onSelectChat={(chat) => {
//           const id = chat.chatId || chat._id;
//           if (!id) return;
//           // reuse your existing loader
//           loadChat(id);
//         }}
//       />

//       <div className="flex-1 flex flex-col">
//         <div className="flex items-center justify-between gap-2 p-2 sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 dark:bg-black dark:border-[#333333] backdrop-blur supports-[backdrop-filter]:bg-white/50">
//           <div className="flex items-center gap-2">
//             <BackButton />
//             <h2 className="text-base sm:text-lg text-black dark:text-white font-medium">
//               AI Product Analyser
//             </h2>
//           </div>
//           <div className="flex items-center gap-2 sm:gap-3">
//             <button
//               onClick={handleCopySummary}
//               className="inline-flex items-center text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition"
//               title="Copy latest summary"
//             >
//               <FiCopy className="w-4 h-4" />
//             </button>

//             <button
//               onClick={handleNewChat}
//               className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#060A21] dark:bg-white text-white dark:text-black rounded-full text-sm cursor-pointer transition-all active:scale-105"
//             >
//               New Chat
//               <BsStars className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         <ChatArea
//           messages={messages}
//           isLoading={isLoading}
//           inputText={inputText}
//           setInputText={setInputText}
//           handleSendMessage={handleSendMessage}
//           handleGenerateQuote={handleGenerateQuote}
//           chatContainerRef={chatContainerRef}
//           imagePreviews={imagePreviews}
//           handleRemoveImage={handleRemoveImage}
//           handleImageSelect={handleImageSelect}
//           fileInputRef={fileInputRef}
//           isChatCompleted={isChatCompleted}
//         />
//       </div>

//       <ToastNotification
//         show={toast.show}
//         message={toast.message}
//         type={toast.type}
//         onClose={() => setToast({ show: false, message: "", type: "" })}
//       />
//     </div>
//   );
// }



/////////////////////////////////
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useFileUpload from "../hooks/useFileUpload";
import { generateUniqueId, showToast } from "../utils/helpers";
import ToastNotification from "../components/UI/ToastNotification";
import ChatArea from "../components/Chat/ChatArea";
import MobileHeader from "../components/Chat/MobileHeader";
import { BsStars } from "react-icons/bs";
import axios from "axios";
import { FiCopy } from "react-icons/fi";
import BackButton from "../components/Chat/BackButton";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isChatCompleted, setIsChatCompleted] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const {
    files: chatImages,
    previews: imagePreviews,
    handleFileSelect: handleImageSelect,
    handleRemoveFile: handleRemoveImage,
    resetFiles: resetChatImages,
  } = useFileUpload();

  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  // Guards to prevent double-sends on first mount
  const initRef = useRef(false);
  const sendingRef = useRef(false);

  const updateChatHeading = useCallback(
    async (chatId, newHeading) => {
      try {
        await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/api/chat/update-heading/${chatId}`,
          { heading: newHeading },
          {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }
        );

        setPreviousChats((prev) =>
          prev.map((chat) => (chat.chatId === chatId ? { ...chat, heading: newHeading } : chat))
        );
      } catch (error) {
        console.error("Error updating chat heading:", error);
      }
    },
    [token]
  );

  const processAIResponse = useCallback(
    (data, chatId) => {
      let aiMessageContent = "";
      let messageType = "info";
      let techPack = null;
      let manufacturingCosts = null;
      let isCompleted = false;

      const newHeading =
        (data?.gptResponse?.heading && String(data.gptResponse.heading).trim()) ||
        (data?.heading && String(data.heading).trim()) ||
        null;

      const images = data.imageUrls || [];

      if (data?.gptResponse) {
        const r = data.gptResponse;
        if (r.question) {
          aiMessageContent = String(r.question);
          messageType = "question";
        } else if (r.summary) {
          aiMessageContent = String(r.summary);
          messageType = "info";
        } else if (r.tech_pack && data.manufacturing_costs) {
          techPack = r.tech_pack;
          manufacturingCosts = data.manufacturing_costs;
          isCompleted = Boolean(data.isCompleted);
          aiMessageContent = "Product analysis is ready.";
          messageType = "final";
        }
      } else if (data?.tech_pack && data.manufacturing_costs) {
        techPack = data.tech_pack;
        manufacturingCosts = data.manufacturing_costs;
        isCompleted = Boolean(data.isCompleted);
        aiMessageContent = "Product analysis is ready.";
        messageType = "final";
      } else {
        aiMessageContent = data?.message || "I've processed your request.";
        messageType = "info";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          role: "ai",
          content: aiMessageContent,
          timestamp: new Date(),
          type: messageType,
          techPack,
          manufacturingCosts,
          isCompleted,
          imageUrls: images,
          chatId,
          gptResponse: data?.gptResponse || null,
        },
      ]);

      if (data.isCompleted) setIsChatCompleted(true);
      if (newHeading) updateChatHeading(chatId, newHeading);
      resetChatImages();
    },
    [resetChatImages, updateChatHeading]
  );

  const sendMessageToAI = useCallback(
    async (messageText, chatId = currentChatId, country = user?.country || "India") => {
      if (!chatId || !user || !token) {
        console.error("Missing required parameters:", { chatId, user: !!user, token: !!token });
        return;
      }
      if (sendingRef.current) return;           // prevent double-submit
      sendingRef.current = true;

      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("prompt", messageText);
        formData.append("country", country);
        formData.append("chatId", chatId);
        formData.append("userId", user.id);

        chatImages.forEach((image) => formData.append("images", image));

        if (location.state?.productImages) {
          location.state.productImages.forEach((image) => formData.append("images", image));
        }

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/clothing/validate`,
          formData,
          { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } }
        );

        processAIResponse(response.data, chatId);
      } catch (error) {
        const status = error?.response?.status;
        const data = error?.response?.data;
        console.error("Error sending message to AI:", status, data, error);
        const msg = data?.error || data?.message || `Request failed${status ? ` (HTTP ${status})` : ""}`;
        showToast(setToast, msg, "error");

        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(),
            role: "ai",
            content: "Sorry, there was an error processing your request. Please try again.",
            timestamp: new Date(),
            type: "error",
          },
        ]);
      } finally {
        setIsLoading(false);
        sendingRef.current = false;
      }
    },
    [currentChatId, user, token, chatImages, location.state, processAIResponse, setMessages]
  );

  // When redirected from Dashboard with initial prompt + images
  const processIncomingChat = useCallback(() => {
    if (location.state?.inputText && location.state?.chatId && location.state?.country && messages.length === 0) {
      setCurrentChatId(location.state.chatId);

      setMessages([
        {
          id: generateUniqueId(),
          role: "user",
          content: location.state.inputText,
          timestamp: new Date(),
          imageUrls: location.state.productImages
            ? location.state.productImages.map((img) => URL.createObjectURL(img))
            : [],
        },
      ]);

      sendMessageToAI(location.state.inputText, location.state.chatId, location.state.country);
    }
  }, [location.state, messages.length, sendMessageToAI]);

  const createNewChat = useCallback(async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/new-chat`,
        { userId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentChatId(response.data.chatId);
      setMessages([]);
      setInputText("");
      resetChatImages();
      setIsChatCompleted(false);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  }, [user, token, resetChatImages]);

  // Initial mount guard to avoid duplicate first call
  useEffect(() => {
    if (!user || !token) return;
    if (initRef.current) return;
    initRef.current = true;

    const hasIncomingChat = !!location.state?.chatId;
    if (hasIncomingChat && messages.length === 0) {
      processIncomingChat();
    } else if (!hasIncomingChat && !currentChatId) {
      createNewChat();
    }
  }, [user, token, location.state, messages.length, currentChatId, processIncomingChat, createNewChat]);

  // Load previous chats for selector
  useEffect(() => {
    if (!user || !token) return;
    (async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/chat/previous-chats/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPreviousChats(res.data.chats || []);
      } catch (e) {
        console.error("Failed to fetch previous chats:", e);
      }
    })();
  }, [user, token]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    setMessages((prev) => [
      ...prev,
      {
        id: generateUniqueId(),
        role: "user",
        content: inputText,
        timestamp: new Date(),
        imageUrls: imagePreviews || [],
      },
    ]);

    const toSend = inputText;
    setInputText("");
    await sendMessageToAI(toSend);
  };

  const handleNewChat = () => navigate("/dashboard", { replace: true });

  const loadChat = async (chatId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/open-chat/${user.id}/${chatId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const chat = response.data.chat;
      const transformedMessages = chat.messages.map((msg) => {
        const role = msg.sender === "user" ? "user" : "ai";
        let content = "";

        if (msg.sender === "user") {
          content = msg.content.text || "";
        } else if (msg.sender === "gpt") {
          if (msg.content.question) content = msg.content.question;
          else if (msg.content.summary) content = msg.content.summary;
          else if (msg.content.tech_pack) content = "Here's your final estimate.";
          else content = JSON.stringify(msg.content);
        }

        return {
          id: msg._id || generateUniqueId(),
          role,
          content,
          timestamp: new Date(msg.timestamp),
          type:
            msg.sender === "gpt"
              ? msg.content.tech_pack && msg.content.manufacturing_costs
                ? "final"
                : msg.content.question
                ? "question"
                : "info"
              : "user",
          techPack: msg.content.tech_pack,
          manufacturingCosts: msg.content.manufacturing_costs,
          isCompleted: msg.isFinal,
          imageUrls: msg.content.imageUrls || [],
          gptResponse: msg.content,
          chatId,
        };
      });

      setCurrentChatId(chatId);
      setMessages(transformedMessages);
      setIsChatCompleted(chat.isCompleted);
    } catch (error) {
      console.error("Error loading chat:", error);
      showToast(setToast, "Failed to load chat", "error");
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <MobileHeader
        onNewChat={handleNewChat}
        currentChat={{ techPack: messages.find((m) => m.techPack)?.techPack }}
        previousChats={previousChats}
        onSelectChat={(chat) => {
          const id = chat.chatId || chat._id;
          if (!id) return;
          loadChat(id);
        }}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between p-2 sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 dark:bg-black dark:border-[#333333] backdrop-blur supports-[backdrop-filter]:bg-white/50">
          <BackButton />
          <h2 className="text-lg text-black dark:text-white font-medium">AI Product Analyser</h2>
          <div className="flex items-center gap-4">
            <button className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition">
              <FiCopy className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 text-black" />
            </button>

            <button
              onClick={handleNewChat}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#060A21] dark:bg-white text-white dark:text-black rounded-full text-sm cursor-pointer transition-all active:scale-105"
            >
              New Chat
              <BsStars className="w-4 h-4 text-white dark:text-black" />
            </button>
          </div>
        </div>

        <ChatArea
          messages={messages}
          isLoading={isLoading}
          inputText={inputText}
          setInputText={setInputText}
          handleSendMessage={handleSendMessage}
          chatContainerRef={chatContainerRef}
          imagePreviews={imagePreviews}
          handleRemoveImage={handleRemoveImage}
          handleImageSelect={handleImageSelect}
          fileInputRef={fileInputRef}
          isChatCompleted={isChatCompleted}
        />
      </div>

      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />
    </div>
  );
}
