import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function UserDetails() {
  const { id: userId } = useParams(); // rename for clarity
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);
  const [errUser, setErrUser] = useState("");
  const [errChats, setErrChats] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      setErrUser("");
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/admin/clothing/user-details/${userId}`,
          { withCredentials: true }
        );
        setUser(res.data);
      } catch (e) {
        setErrUser(e?.response?.data?.error || "Failed to fetch user details");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [userId]);

  useEffect(() => {
    const fetchChats = async () => {
      setLoadingChats(true);
      setErrChats("");
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/clothing/all-user-chats/${userId}?page=1&direction=desc`,
          { withCredentials: true }
        );
        setChats(res.data.chats || []);
      } catch (e) {
        setErrChats(e?.response?.data?.error || "Failed to fetch user chats");
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, [userId]);

  if (loadingUser) return <p>Loading user details…</p>;
  if (errUser) return <p className="alert">{errUser}</p>;
  if (!user) return <p>User not found.</p>;

  return (
    <div className="user-details-card">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2>User Details</h2>
      <div className="user-details-info">
        <p>
          <strong>Name:</strong> {user.name || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {user.email || "N/A"}
        </p>
        <p>
          <strong>Mobile:</strong> {user.mobile || "N/A"}
        </p>
        <p>
          <strong>Country:</strong> {user.country || "N/A"}
        </p>
        <p>
          <strong>Google ID:</strong> {user.googleId || "N/A"}
        </p>
        {user.chatCount !== undefined && (
          <p>
            <strong>Chat Count:</strong> {user.chatCount}
          </p>
        )}
        <p>
          <strong>Last Login:</strong>{" "}
          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {new Date(user.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Updated At:</strong>{" "}
          {new Date(user.updatedAt).toLocaleString()}
        </p>
      </div>

      <h3>User Chats</h3>
      {loadingChats ? (
        <p>Loading chats…</p>
      ) : errChats ? (
        <p className="alert">{errChats}</p>
      ) : chats.length === 0 ? (
        <p>No chats found.</p>
      ) : (
        <table
          className="user-chats-table"
          border="1"
          cellPadding="8"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Heading</th>
              <th>Model Type</th>
              <th>Completed</th>
              <th>Created At</th>
              <th>Product ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {chats.map((chat) => (
              <tr key={chat._id}>
                <td>{chat.heading}</td>
                <td>{chat.modelType}</td>
                <td>{chat.isCompleted ? "✅" : "❌"}</td>
                <td>{new Date(chat.createdAt).toLocaleString()}</td>
                <td>{chat.productId || "-"}</td>
                <td>
                  <button
                    onClick={() =>
                      // ✅ Pass both IDs directly in the path
                      navigate(`/dashboard/chats/${userId}/${chat._id}`)
                    }
                  >
                    View Chat
                  </button>
                  {chat.productId && (
                    <button
                      onClick={() =>
                        navigate(`/dashboard/quote/${chat.productId}`)
                      }
                    >
                      View Product
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
