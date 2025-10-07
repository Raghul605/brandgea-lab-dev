import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import api from "../api/axios";
import axios from "axios";

export default function ChatDetails() {
  const { userId, chatId } = useParams(); 
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChat = async () => {
      if (!userId || !chatId) return;
      setLoading(true);
      setErr("");
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/clothing/chat-details/${userId}/${chatId}`,{ withCredentials: true });
        setData(res.data);
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to fetch chat details");
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [userId, chatId]);

  if (loading) return <div className="loader">Loading…</div>;
  if (err) return <div className="alert">{err}</div>;
  if (!data || !data.chat) return <div>No chat details found.</div>;

  const chat = data.chat;

  return (
    <div className="card">
      <div className="card__header">
        <h3>Chat Details</h3>
      </div>

      <section className="details__section">
        <h4>Chat</h4>
        <div><strong>Heading:</strong> {chat.heading || "-"}</div>
        <div><strong>Model Type:</strong> {chat.modelType || "-"}</div>
        <div><strong>Completed:</strong> {chat.isCompleted ? "✅" : "❌"}</div>
        <div><strong>Created At:</strong> {chat.createdAt ? new Date(chat.createdAt).toLocaleString() : "-"}</div>
        <div><strong>Product ID:</strong> {chat.productId || "-"}</div>
      </section>

      <section className="details__section">
        <h4>Chat History</h4>
        {chat.messages && Array.isArray(chat.messages) && chat.messages.length > 0 ? (
          <div className="chat__container">
            {chat.messages.map((msg, index) => (
              <div key={index} className="chat__message" style={{ marginBottom: "10px" }}>
                <div><strong>{msg.sender === "gpt" ? "System" : "User"}:</strong></div>
                {msg.content?.text && <div>{msg.content.text}</div>}
                {msg.content?.question && <div><em>{msg.content.question}</em></div>}
                {msg.content?.imageUrls?.length > 0 &&
                  msg.content.imageUrls.map((url, i) => (
                    <div key={i} style={{ marginBottom: "8px" }}>
                      <img src={url} alt={`Uploaded ${i + 1}`} style={{ maxWidth: "150px", borderRadius: "8px" }} />
                      <br />
                      <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff" }}>
                        View Full Image
                      </a>
                    </div>
                  ))}
                <small>{msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ""}</small>
                <hr />
              </div>
            ))}
          </div>
        ) : (
          <div>No chat history available.</div>
        )}
      </section>
    </div>
  );
}
