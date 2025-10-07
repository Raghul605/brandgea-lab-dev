// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../api/axios";
// import "./QuoteDetails.css";

// export default function QuoteDetails() {
//   const { id } = useParams();
//   const [data, setData] = useState(null);
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchQuoteDetails = async () => {
//       setLoading(true);
//       setErr("");
//       try {
//         const res = await api.get(`/admin/clothing/quote-details-product/${id}`);
//         setData(res.data);
//       } catch (e) {
//         setErr(e?.response?.data?.error || "Failed to fetch quote details");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchQuoteDetails();
//   }, [id]);

//   if (loading) return <div className="loader">Loading…</div>;
//   if (err) return <div className="alert">{err}</div>;
//   if (!data) return <div>No details found.</div>;

//   const { product, user, chat } = data;

//   return (
//     <div className="card">
//       <div className="card__header">
//         <h3>Quote Details</h3>
//       </div>

//       <div className="details">
//         {/* User Details */}
//         <section className="details__section">
//           <h4>User Information</h4>
//           <div><strong>Name:</strong> {user?.name || "-"}</div>
//           <div><strong>Email:</strong> {user?.email || "-"}</div>
//         </section>

//         {/* Product Details */}
//         <section className="details__section">
//           <h4>Product Information</h4>
//           {product ? (
//             <div className="details__grid">
//               <div><strong>Heading:</strong> {product.heading || "-"}</div>
//               <div><strong>Country:</strong> {product.country || "-"}</div>
//               <div>
//                 <strong>Profit Margin:</strong>{" "}
//                 {product.profit_margin ? `${product.profit_margin * 100}%` : "-"}
//               </div>
//               <div><strong>Quote Number:</strong> {product.quoteNumber || "-"}</div>
//               <div>
//                 <strong>Created At:</strong>{" "}
//                 {product.createdAt ? new Date(product.createdAt).toLocaleString() : "-"}
//               </div>

//               <hr />

//               <h5>Tech Pack</h5>
//               {product.tech_pack ? (
//                 <>
//                   <div><strong>Garment Type:</strong> {product.tech_pack.garment_type}</div>
//                   <div><strong>Material:</strong> {product.tech_pack.material}</div>
//                   <div><strong>GSM:</strong> {product.tech_pack.gsm}</div>
//                   <div><strong>Colors:</strong> {product.tech_pack.color.join(", ")}</div>
//                   <div><strong>Wash Treatments:</strong> {product.tech_pack.wash_treatments.join(", ")}</div>
//                   <div><strong>Complexity:</strong> {product.tech_pack.complexity_class}</div>
//                   <div><strong>Comments:</strong> {product.tech_pack.additional_comments}</div>
//                 </>
//               ) : (
//                 <div>No tech pack available.</div>
//               )}

//               <hr />

//               <h5>Manufacturing Costs</h5>
//               {product.manufacturing_costs ? (
//                 <ul>
//                   {Object.entries(product.manufacturing_costs)
//                     .filter(([key]) => key !== "currency")
//                     .map(([qty, cost]) => (
//                       <li key={qty}>
//                         {qty} pcs: {cost} {product.manufacturing_costs.currency}
//                       </li>
//                     ))}
//                 </ul>
//               ) : (
//                 <div>No cost data.</div>
//               )}

//               <h5>Cost with Profit</h5>
//               {product.cost_with_profit ? (
//                 <ul>
//                   {Object.entries(product.cost_with_profit)
//                     .filter(([key]) => key !== "currency")
//                     .map(([qty, cost]) => (
//                       <li key={qty}>
//                         {qty} pcs: {cost} {product.cost_with_profit.currency}
//                       </li>
//                     ))}
//                 </ul>
//               ) : (
//                 <div>No profit data.</div>
//               )}
//             </div>
//           ) : (
//             <div>No product details available.</div>
//           )}
//         </section>

//         {/* Chat History */}
//         <section className="details__section">
//           <h4>Chat History</h4>
//           {chat?.messages?.length > 0 ? (
//             <div className="chat__container">
//               {chat.messages.map((msg, index) => (
//                 <div key={index} className="chat__message" style={{ marginBottom: "10px" }}>
//                   <div><strong>{msg.sender === "gpt" ? "System" : "User"}:</strong></div>

//                   {msg.content.text && <div>{msg.content.text}</div>}
//                   {msg.content.question && <div><em>{msg.content.question}</em></div>}

//                   {msg.content.imageUrls?.length > 0 && (
//                     <div style={{ marginTop: "8px" }}>
//                       {msg.content.imageUrls.map((url, i) => (
//                         <div key={i} style={{ marginBottom: "8px" }}>
//                           <img
//                             src={url}
//                             alt={`Uploaded ${i + 1}`}
//                             style={{ maxWidth: "150px", borderRadius: "8px" }}
//                           />
//                           <br />
//                           <a
//                             href={url}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             style={{ color: "#007bff" }}
//                           >
//                             View Full Image
//                           </a>
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   <small>{msg.timestamp ? new Date(msg.timestamp).toLocaleString() : "-"}</small>
//                   <hr />
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div>No chat history available.</div>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./QuoteDetails.css";

export default function QuoteDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuoteDetails = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/admin/clothing/quote-details-product/${id}`,
          { withCredentials: true }
        );
        setData(res.data);
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to fetch quote details");
      } finally {
        setLoading(false);
      }
    };
    fetchQuoteDetails();
  }, [id]);

  if (loading) return <div className="quote-details-container">Loading…</div>;
  if (err) return <div className="quote-details-container">{err}</div>;
  if (!data)
    return <div className="quote-details-container">No details found.</div>;

  const { product, user, chat } = data;

  return (
    <div className="quote-details-container">
      <h2 className="quote-title">Quote #{product?.quoteNumber}</h2>

      {/* User Info */}
      <section className="quote-field">
        <h3 className="quote-label">User Information</h3>
        <div className="quote-value">
          <strong>Name:</strong> {user?.name || "—"}
        </div>
        <div className="quote-value">
          <strong>Email:</strong> {user?.email || "—"}
        </div>
      </section>

      {/* Product Info */}
      <section className="quote-field">
        <h3 className="quote-label">Product Information</h3>
        <div className="quote-value">
          <strong>Heading:</strong> {product?.heading}
        </div>
        <div className="quote-value">
          <strong>Country:</strong> {product?.country}
        </div>
        <div className="quote-value">
          <strong>Profit Margin:</strong>{" "}
          {product?.profit_margin ? `${product.profit_margin * 100}%` : "—"}
        </div>
        <div className="quote-value">
          <strong>Created At:</strong>{" "}
          {product?.createdAt
            ? new Date(product.createdAt).toLocaleString()
            : "—"}
        </div>
      </section>

      {/* Tech Pack */}
      <section className="quote-field">
        <h3 className="quote-label">Tech Pack</h3>
        {product?.tech_pack ? (
          <>
            <div className="quote-value">
              <strong>Garment:</strong> {product.tech_pack.garment_type}
            </div>
            <div className="quote-value">
              <strong>Material:</strong> {product.tech_pack.material}
            </div>
            <div className="quote-value">
              <strong>GSM:</strong> {product.tech_pack.gsm}
            </div>
            <div className="quote-value">
              <strong>Colors:</strong> {product.tech_pack.color.join(", ")}
            </div>
            <div className="quote-value">
              <strong>Wash:</strong>{" "}
              {product.tech_pack.wash_treatments.join(", ")}
            </div>
            <div className="quote-value">
              <strong>Complexity:</strong> {product.tech_pack.complexity_class}
            </div>
            <div className="quote-value">
              <strong>Comments:</strong> {product.tech_pack.additional_comments}
            </div>
          </>
        ) : (
          <div className="quote-value">No tech pack available.</div>
        )}
      </section>

      {/* Manufacturing Costs */}
      <section className="quote-field">
        <h3 className="quote-label">Manufacturing Costs</h3>
        {product?.manufacturing_costs ? (
          <table className="quote-table">
            <thead>
              <tr>
                <th>Qty</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(product.manufacturing_costs)
                .filter(([k]) => k !== "currency")
                .map(([qty, cost]) => (
                  <tr key={qty}>
                    <td>{qty} pcs</td>
                    <td>
                      {cost} {product.manufacturing_costs.currency}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div className="quote-value">No data.</div>
        )}
      </section>

      {/* Cost with Profit */}
      <section className="quote-field">
        <h3 className="quote-label">Cost With Profit</h3>
        {product?.cost_with_profit ? (
          <table className="quote-table">
            <thead>
              <tr>
                <th>Qty</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(product.cost_with_profit)
                .filter(([k]) => k !== "currency")
                .map(([qty, cost]) => (
                  <tr key={qty}>
                    <td>{qty} pcs</td>
                    <td>
                      {cost} {product.cost_with_profit.currency}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div className="quote-value">No data.</div>
        )}
      </section>

      {/* Chat History */}
      <section className="quote-field">
        <h3 className="quote-label">Chat History</h3>
        {chat?.messages?.length > 0 ? (
          <div className="chat-box">
            {chat.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${
                  msg.sender === "user" ? "user-msg" : "system-msg"
                }`}
              >
                {msg.content.text && <p>{msg.content.text}</p>}
                {msg.content.question && <em>{msg.content.question}</em>}
                {msg.content.imageUrls?.length > 0 && (
                  <div className="chat-images">
                    {msg.content.imageUrls.map((url, i) => (
                      <img key={i} src={url} alt="ref" />
                    ))}
                  </div>
                )}
                <small>{new Date(msg.timestamp).toLocaleString()}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="quote-value">No chat history available.</div>
        )}
      </section>

      <Link to="/admin/quotes" className="back-button">
        ← Back
      </Link>
    </div>
  );
}
