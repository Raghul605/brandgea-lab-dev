// // src/components/ManufacturerPurchase.jsx
// import React, { useEffect, useRef, useState } from "react";
// import { useAuth } from "../../context/AuthContext";

// export default function ManufacturerPurchase({ chatId }) {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isPurchased, setIsPurchased] = useState(false);
//   const [paymentSession, setPaymentSession] = useState(null);
//   const zpayInstance = useRef(null);
//   const { user } = useAuth();

//   // Load Zoho Payments script
//   useEffect(() => {
//     const loadZohoScript = () => {
//       if (window.ZPayments) return;

//       const script = document.createElement("script");
//       script.src = "https://www.zoho.com/payments/checkout/checkout.v2.js";
//       script.onload = () => console.log("Zoho Payments script loaded");
//       script.onerror = () =>
//         console.error("Failed to load Zoho Payments script");
//       document.head.appendChild(script);
//     };

//     loadZohoScript();
//   }, []);

//   // Initialize ZPayments when paymentSession is available
//   useEffect(() => {
//     if (window.ZPayments && paymentSession) {
//       const config = {
//         account_id: import.meta.env.VITE_ZOHO_ACCOUNT_ID,
//         domain: "IN",
//         otherOptions: {
//           api_key: import.meta.env.VITE_ZOHO_API_KEY,
//         },
//       };
//       zpayInstance.current = new window.ZPayments(config);
//       initiatePayment();
//     }
//   }, [paymentSession]);

//   const initiatePayment = async () => {
//     if (!zpayInstance.current || !paymentSession) return;

//     try {
//       const result = await zpayInstance.current.requestPaymentMethod({
//         amount: paymentSession.amount,
//         currency_code: paymentSession.currency,
//         payments_session_id: paymentSession.payments_session_id,
//         description: paymentSession.description,
//         invoice_number: paymentSession.invoice_number,
//         reference_number: paymentSession.reference_number || "",
//         address: paymentSession.address || {},
//       });

//       //Payment successful
//       console.log("Payment success", result.payment_id);
//       // setIsContactModalOpen(true);
//     } catch (err) {
//       if (err.code === "widget_closed") {
//         console.log("Payment widget closed by user");
//       } else {
//         console.error("Payment failed:", err.message);
//         alert("Payment failed. Please try again.");
//       }
//     } finally {
//       setPaymentSession(null);
//       if (zpayInstance.current) {
//         await zpayInstance.current.close();
//       }
//     }
//   };

//   const handlePurchaseClick = async () => {
//     setIsProcessing(true);

//     try {
//       // Create payment session for manufacturer list purchase
//       const response = await fetch(
//         "https://89a5ce8697b1.ngrok-free.app/api/zoho/initiate",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             userId: user.id,
//             chatId: chatId,
//             planKey: "basic_plan_99",
//             description: "Manufacturer List Purchase",
//             currency: "INR",
//           }),
//         }
//       );

//             if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to create payment session");
//       }

//       const data = await response.json();
//       setPaymentSession(data);
//     } catch (error) {
//       console.error("Payment initiation error:", error);
//       setIsProcessing(false);
//       alert("Error initiating payment. Please try again.");
//     }
//   };

//   if (isPurchased) {
//     return (
//       <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-center">
//         <p className="text-[13px] sm:text-sm text-green-700 leading-relaxed">
//           Payment successful! You'll receive an email with the list of
//           manufacturers within an hour.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="mt-3 sm:mt-4 text-center">
//       <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
//         Need a list of manufacturers who produce this product?
//       </p>
//       <button
//         onClick={handlePurchaseClick}
//         disabled={isProcessing}
//         className={`inline-flex items-center justify-center h-10 sm:h-11 px-4 sm:px-6 rounded-full text-[13px] sm:text-sm font-medium transition-colors active:scale-[0.98] ${
//           isProcessing
//             ? "bg-gray-400 text-gray-700 cursor-not-allowed"
//             : "bg-blue-600 text-white hover:bg-blue-700"
//         }`}
//       >
//         {isProcessing ? "Redirecting to payment..." : "Get it for ₹999"}
//       </button>
//     </div>
//   );
// }


// src/components/ManufacturerPurchase.jsx
// import React, { useEffect, useRef, useState } from "react";
// import { useAuth } from "../../context/AuthContext";

// export default function ManufacturerPurchase({ chatId, paid = false, onPaid }) {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isPurchased, setIsPurchased] = useState(!!paid);
//   const [paymentSession, setPaymentSession] = useState(null);
//   const [errorMsg, setErrorMsg] = useState("");
//   const zpayInstance = useRef(null);
//   const { user } = useAuth();

//   useEffect(() => {
//     if(paid && !isPurchased) setIsPurchased(true);
//   }, [paid]);

//   // Load Zoho Payments script once
//   useEffect(() => {
//     if (window.ZPayments) return;
//     const script = document.createElement("script");
//     script.src = "https://www.zoho.com/payments/checkout/checkout.v2.js";
//     script.async = true;
//     script.onload = () => console.log("[Zoho] script loaded");
//     script.onerror = () => console.error("[Zoho] script load failed");
//     document.head.appendChild(script);
//   }, []);

//   // Create instance when we have both: script + session
//   useEffect(() => {
//     if (!paymentSession) return;
//     if (!window.ZPayments) {
//       // wait a tick for the script, then retry
//       const t = setTimeout(() => setPaymentSession({ ...paymentSession }), 100);
//       return () => clearTimeout(t);
//     }
//     // create a fresh instance each time we show the widget
//     zpayInstance.current = new window.ZPayments({
//       account_id: import.meta.env.VITE_ZOHO_ACCOUNT_ID,
//       domain: "IN",
//       otherOptions: {
//         api_key: import.meta.env.VITE_ZOHO_API_KEY,
//         // NOTE: do NOT add undocumented flags here
//       },
//     });
//     initiatePayment();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [paymentSession]);

//   const cleanupWidget = async () => {
//     try {
//       if (zpayInstance.current) {
//         await zpayInstance.current.close();
//       }
//     } catch (_) {}
//     zpayInstance.current = null;
//     setPaymentSession(null);
//     setIsProcessing(false);
//   };

//   const initiatePayment = async () => {
//     if (!zpayInstance.current || !paymentSession) return;
//     try {
//       const result = await zpayInstance.current.requestPaymentMethod({
//         amount: paymentSession.amount,
//         currency_code: paymentSession.currency,
//         payments_session_id: paymentSession.payments_session_id,
//         description: paymentSession.description,
//         invoice_number: paymentSession.invoice_number,
//         reference_number: paymentSession.reference_number || "",
//         address: paymentSession.address || {},
//       });

//       // If we got here without throwing, widget says success
//       console.log("[Zoho] Payment success:", result);
//       setIsPurchased(true);
//       if(onPaid) onPaid();
//       setErrorMsg("");
//     } catch (err) {
//       if (err?.code === "widget_closed") {
//         console.log("[Zoho] Widget closed by user");
//         setErrorMsg(""); // treat as a cancel, no error
//       } else {
//         console.error("[Zoho] Payment failed:", err);
//         setErrorMsg(err?.message || "Payment failed. Please try again.");
//       }
//     } finally {
//       await cleanupWidget();
//     }
//   };

//   const handlePurchaseClick = async () => {
//     setIsProcessing(true);
//     setErrorMsg("");
//     try {
//       const response = await fetch(
//         // use your own backend URL
//         "https://964069495cc8.ngrok-free.app/api/zoho/initiate",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             userId: user.id,
//             chatId,
//             planKey: "basic_plan_99",
//             description: "Manufacturer List Purchase",
//             currency: "INR",
//           }),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || "Failed to create payment session");
//       }

//       const data = await response.json();
//       setPaymentSession(data);
//       // do NOT set isProcessing false here; keep spinner until widget resolves
//     } catch (error) {
//       console.error("[Zoho] Init error:", error);
//       setErrorMsg(error.message || "Error initiating payment");
//       setIsProcessing(false);
//     }
//   };

//   if (isPurchased) {
//     return (
//       <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-center">
//         <p className="text-[13px] sm:text-sm text-green-700 leading-relaxed">
//           Payment successful! You’ll receive an email with the list of manufacturers soon.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="mt-3 sm:mt-4 text-center">
//       <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
//         Need a list of manufacturers who produce this product?
//       </p>

//       {errorMsg && (
//         <p className="text-xs text-red-600 mb-2">{errorMsg}</p>
//       )}

//       <button
//         onClick={handlePurchaseClick}
//         disabled={isProcessing}
//         className={`inline-flex items-center justify-center h-10 sm:h-11 px-4 sm:px-6 rounded-full text-[13px] sm:text-sm font-medium transition-colors active:scale-[0.98] ${
//           isProcessing
//             ? "bg-gray-400 text-gray-700 cursor-not-allowed"
//             : "bg-blue-600 text-white hover:bg-blue-700"
//         }`}
//       >
//         {isProcessing ? "Opening payment..." : "Get it for ₹999"}
//       </button>
//     </div>
//   );
// }


import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function ManufacturerPurchase({ chatId, paid = false, onPaid }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPurchased, setIsPurchased] = useState(!!paid);
  const [paymentSession, setPaymentSession] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const zpayInstance = useRef(null);
  const { user } = useAuth();

  // Sync with parent if it later re-renders with paid=true (e.g., after a refresh)
  useEffect(() => {
    if (paid && !isPurchased) setIsPurchased(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paid]);

  // Load Zoho Payments script once
  useEffect(() => {
    if (window.ZPayments) return;
    const script = document.createElement("script");
    script.src = "https://www.zoho.com/payments/checkout/checkout.v2.js";
    script.async = true;
    script.onload = () => console.log("[Zoho] script loaded");
    script.onerror = () => console.error("[Zoho] script load failed");
    document.head.appendChild(script);
  }, []);

  // Create instance when we have both: script + session
  useEffect(() => {
    if (!paymentSession) return;
    if (!window.ZPayments) {
      const t = setTimeout(() => setPaymentSession({ ...paymentSession }), 100);
      return () => clearTimeout(t);
    }
    zpayInstance.current = new window.ZPayments({
      account_id: import.meta.env.VITE_ZOHO_ACCOUNT_ID,
      domain: "IN",
      otherOptions: { api_key: import.meta.env.VITE_ZOHO_API_KEY },
    });
    initiatePayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentSession]);

  const cleanupWidget = async () => {
    try {
      if (zpayInstance.current) await zpayInstance.current.close();
    } catch (_) {}
    zpayInstance.current = null;
    setPaymentSession(null);
    setIsProcessing(false);
  };

  const initiatePayment = async () => {
    if (!zpayInstance.current || !paymentSession) return;
    try {
      const result = await zpayInstance.current.requestPaymentMethod({
        amount: paymentSession.amount,
        currency_code: paymentSession.currency,
        payments_session_id: paymentSession.payments_session_id,
        description: paymentSession.description,
        invoice_number: paymentSession.invoice_number,
        reference_number: paymentSession.reference_number || "",
        address: paymentSession.address || {},
      });

      console.log("[Zoho] Payment success:", result);
      setIsPurchased(true);
      setErrorMsg("");
      if (typeof onPaid === "function") onPaid(); // tell parent to flip immediately
    } catch (err) {
      if (err?.code === "widget_closed") {
        console.log("[Zoho] Widget closed by user");
        setErrorMsg(""); // user canceled; not an error
      } else {
        console.error("[Zoho] Payment failed:", err);
        setErrorMsg(err?.message || "Payment failed. Please try again.");
      }
    } finally {
      await cleanupWidget();
    }
  };

  const handlePurchaseClick = async () => {
    setIsProcessing(true);
    setErrorMsg("");
    try {
      const response = await fetch(
        "https://brandgea-lab-dev.onrender.com/api/zoho/initiate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            chatId,
            planKey: "basic_plan_499",
            description: "Manufacturer List Purchase",
            currency: "INR",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create payment session");
      }

      const data = await response.json();
      setPaymentSession(data); // keep spinner until widget resolves
    } catch (error) {
      console.error("[Zoho] Init error:", error);
      setErrorMsg(error.message || "Error initiating payment");
      setIsProcessing(false);
    }
  };

  if (isPurchased) {
    return (
      <div className="mt-3 sm:mt-4 w-full">
        <div className="rounded-xl border border-gray-200/70 dark:border-[#333333] bg-white/70 dark:bg-[#101010]/80 backdrop-blur-sm p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-black/90 dark:bg-white/90 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white dark:text-black"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              Payment successful
            </div>
          </div>

          <p className="text-[13px] sm:text-sm text-gray-800 dark:text-gray-200 mb-3">
            What happens next:
          </p>

          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Step 1:</span>{" "}
              <span className="text-gray-800 text-sm dark:text-gray-200">
                Our RM will reach you and carefully capture your requirements.
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Step 2:</span>{" "}
              <span className="text-gray-800 text-sm dark:text-gray-200">
                Within 24 hours, you’ll get:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>5 verified manufacturer quotes</li>
                  <li>Detailed profiles (catalog, past work, TAT, location)</li>
                </ul>
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Step 3:</span>{" "}
              <span className="text-gray-800 text-sm dark:text-gray-200">
                You’ll be notified as soon as your quotes are ready.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 sm:mt-4 text-center">
      <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-300 mb-4">
        Pay ₹499 and let our RM Find the 5 best-fit manufacturers, negotiate quotes, and share their full profiles with you
      </p>

      {errorMsg && <p className="text-xs text-red-600 mb-2">{errorMsg}</p>}

      <button
        onClick={handlePurchaseClick}
        disabled={isProcessing}
        className={`inline-flex items-center justify-center h-10 sm:h-11 px-4 sm:px-6 rounded-full text-[13px] sm:text-sm font-medium transition-colors active:scale-[0.98] ${
          isProcessing
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isProcessing ? "Opening payment..." : "Get it for ₹499"}
      </button>
    </div>
  );
}
