// import React, { useCallback, useEffect, useState } from "react";
// import Header from "../components/Layout/Header";
// import ProductDescriptionForm from "../components/Dashboard/ProductDescriptionForm";
// import { templates } from "../utils/mockTemplates";
// import TemplateCard from "../components/Dashboard/TemplateCard";
// import QuoteResultDialog from "../components/Dashboard/QuoteResultDialog";
// import { useAuth } from "../context/AuthContext";
// import ContactFormModal from "../components/Dashboard/ContactFormModal";
// import { sendManufacturingEmail } from "../utils/emailService";
// import axios from "axios";
// import LoginModal from "../components/Auth/LoginModal";
// import ToastNotification from "../components/UI/ToastNotification";
// import { useNavigate } from "react-router-dom";

// export default function Dashboard() {
//   const [inputText, setInputText] = useState("");
//   const [quoteData, setQuoteData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isImageModalOpen, setIsImageModalOpen] = useState(false);
//   const [productImages, setProductImages] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [isContactModalOpen, setIsContactModalOpen] = useState(false);
//   const [contactStatus, setContactStatus] = useState(null);
//   const { user, updateMobileNumber, token, promptLogin, waitForLogin } =
//     useAuth();

//   const [userCountry, setUserCountry] = useState("India");
//   const [countryLoading, setCountryLoading] = useState(false);
//   const [toast, setToast] = useState({ show: false, message: "", type: "" });
//   const navigate = useNavigate();

//   useEffect(() => {
//     const detectCountry = async () => {
//       try {
//         setCountryLoading(true);
//         const response = await axios.get(
//           "https://free.freeipapi.com/api/json/"
//         );
//         if (response.data.countryName) {
//           setUserCountry(response.data.countryName);
//         }
//       } catch (err) {
//         console.error("Country API error:", err);
//       } finally {
//         setCountryLoading(false);
//       }
//     };

//     detectCountry();
//   }, []);

//   const showToast = (message, type = "info") => {
//     setToast({ show: true, message, type });
//     setTimeout(() => setToast({ show: false, message: "", type: "" }), 5000);
//   };

//   const submitForm = useCallback(async () => {
//     if (!token) {
//       showToast(["Please sign in to continue"]);
//       return false;
//     }

//     // Validate inputs
//     const validationErrors = [];
//     if (!inputText.trim()) {
//       showToast("Please enter a product description", "error");
//       return false;
//     }
//     if (productImages.length === 0) {
//       showToast("Please attach at least one image", "error");
//       return false;
//     }

//     if (validationErrors.length > 0) {
//       showToast(validationErrors);
//       return false;
//     }

//     setIsLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("prompt", inputText);
//       formData.append("country", userCountry);

//       productImages.forEach((image) => {
//         formData.append("images", image);
//       });

//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/clothing/validate`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = response.data;

//       if (data.error) {
//         throw new Error(data.error);
//       }
//       if (data.match === false) {
//         throw new Error(data.reason || "Garment type mismatch");
//       }

//       const { manufacturing_costs, tech_pack, imageUrls } = data;
//       const { currency = "INR", ...costs } = manufacturing_costs || {};
//       const pricing = Object.entries(costs).reduce((acc, [qty, unitPrice]) => {
//         const priceNum = Number(unitPrice);
//         if (Number.isFinite(priceNum)) {
//           acc[String(qty)] = { price: priceNum, currency };
//         }
//         return acc;
//       }, {});

//       setQuoteData({
//         pricing,
//         updatedCosts: manufacturing_costs,
//         techPack: tech_pack,
//         imageUrls: imageUrls,
//         sanitizedInput: inputText,
//         country: userCountry,
//       });
//       setIsDialogOpen(true);
//       showToast("Quote generated successfully!", "success");
//       return true;
//     } catch (error) {
//       console.error("Quote generation failed:", error);

//       let errorMessage = "Failed to generate quote. Please try again.";
//       if (error.code === "ECONNABORTED") {
//         errorMessage = "Request timeout. Please try again.";
//       } else if (error.response?.status === 413) {
//         errorMessage = "File size too large. Please use smaller images.";
//       } else if (error.response?.status === 429) {
//         errorMessage = "Too many requests. Please try again later.";
//       } else {
//         const api = error.response?.data;
//         errorMessage =
//           api?.message ||
//           api?.reason ||
//           api?.error ||
//           error.message ||
//           errorMessage;
//       }

//       showToast(errorMessage, "error");
//       return false;
//     } finally {
//       setIsLoading(false);
//     }
//   }, [inputText, productImages, token, userCountry]);

//   const handleSubmit = useCallback(
//     async (e) => {
//       try {
//         e.preventDefault();

//         if (!inputText.trim()) {
//           showToast("Please enter a product description", "error");
//           return;
//         }

//         if (!user) {
//           // Store form data before showing login
//           const formData = {
//             inputText,
//             productImages, // Include product images
//             userCountry,
//           };

//           promptLogin(async () => {
//             // After login, create a new chat and redirect
//             try {
//               const response = await axios.post(
//                 `${import.meta.env.VITE_BACKEND_URL}/api/chat/new-chat`,
//                 { userId: user.id },
//                 {
//                   headers: {
//                     Authorization: `Bearer ${token}`,
//                   },
//                 }
//               );

//               const chatId = response.data.chatId;
//               navigate("/chat", {
//                 state: {
//                   inputText: formData.inputText,
//                   productImages: formData.productImages, // Pass images to chat page
//                   country: formData.userCountry,
//                   chatId: chatId,
//                 },
//               });
//             } catch (error) {
//               console.error("Error creating new chat:", error);
//               showToast("Failed to create chat", "error");
//             }
//           });
//           return;
//         }

//         try {
//           const response = await axios.post(
//             `${import.meta.env.VITE_BACKEND_URL}/api/chat/new-chat`,
//             { userId: user.id },
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );

//           const chatId = response.data.chatId;
//           console.log("[Dashboard] Navigating to /chat with:", {
//             inputText,
//             productImages,
//             userCountry,
//             chatId,
//           });
//           navigate("/chat", {
//             state: {
//               inputText: inputText,
//               productImages: productImages, // Pass images to chat page
//               country: userCountry,
//               chatId: chatId,
//             },
//           });
//         } catch (error) {
//           console.error("Error creating new chat:", error);
//           showToast("Failed to create chat", "error");
//         }
//       } catch (error) {
//         console.error("Submission error:", error);
//         showToast("Failed to submit. Please try again.", "error");
//       }
//     },
//     [user, promptLogin, inputText, productImages, userCountry, navigate, token]
//   );

//   const handleReset = () => {
//     setInputText("");
//     setIsDialogOpen(false);
//     setProductImages([]);
//     setImagePreviews([]);
//   };

//   const handleCloseDialog = () => {
//     setIsDialogOpen(false);
//     handleReset();
//   };

//   const handleImageSelect = (e) => {
//     const files = Array.from(e.target.files);

//     const MAX_FILES = 2;
//     const MAX_SIZE = 5 * 1024 * 1024;
//     const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

//     // Check if adding would exceed limit
//     if (productImages.length + files.length > MAX_FILES) {
//       showToast(`You can only upload up to ${MAX_FILES} images.`, "error");
//       e.target.value = ""; // Reset file input
//       return;
//     }

//     const validFiles = [];
//     const validationErrors = [];

//     files.forEach((file) => {
//       if (!ALLOWED_TYPES.includes(file.type)) {
//         validationErrors.push("Only JPEG, PNG, and WebP images are allowed.");
//         return;
//       }

//       if (file.size > MAX_SIZE) {
//         validationErrors.push("Each file must be under 5MB.");
//         return;
//       }

//       validFiles.push(file);
//     });

//     if (validationErrors.length > 0) {
//       showToast(validationErrors[0], "error");
//       e.target.value = ""; // Reset file input
//       return;
//     }

//     if (validFiles.length === 0) {
//       e.target.value = ""; // Reset file input
//       return;
//     }

//     // Create previews for valid files
//     const previewPromises = validFiles.map(
//       (file) =>
//         new Promise((resolve) => {
//           const reader = new FileReader();
//           reader.onload = () => resolve(reader.result);
//           reader.readAsDataURL(file);
//         })
//     );

//     Promise.all(previewPromises).then((newPreviews) => {
//       setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 2));
//       setProductImages((prev) => [...prev, ...validFiles].slice(0, 2));
//     });

//     e.target.value = ""; // Reset file input
//     setIsImageModalOpen(false);
//   };

//   const handleRemoveImage = (index) => {
//     const newImages = [...productImages];
//     const newPreviews = [...imagePreviews];

//     newImages.splice(index, 1);
//     newPreviews.splice(index, 1);

//     setProductImages(newImages);
//     setImagePreviews(newPreviews);
//   };

//   const handleContactSubmit = async (formData) => {
//     try {
//       // 1. Update user mobile number
//       if (formData.mobile && formData.mobile !== (user?.mobile || "")) {
//         await updateMobileNumber(formData.mobile);
//       }

//       // 2. Send emails
//       await sendManufacturingEmail(formData);

//       setContactStatus("success");
//       showToast("Request submitted successfully!", "success");
//       setTimeout(() => {
//         setIsContactModalOpen(false);
//         setContactStatus(null);
//         handleReset();
//       }, 2000);
//     } catch (error) {
//       console.error("Contact request failed:", error);
//       setContactStatus("error");
//       showToast("Failed to submit request. Please try again.", "error");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#030509]">
//       <Header />
//       <main className="py-2 px-2">
//         <div className="rounded-xl overflow-hidden">
//           <div className="p-4 text-center">
//             <h2 className="text-3xl font-bold text-gray-200">
//               AI-Powered Apparel Quotation
//             </h2>
//             <p className="text-gray-400 mt-2">
//               Describe your product in detail and get an instant quote
//             </p>
//           </div>

//           <div className="p-6 max-w-4xl mx-auto">
//             <ProductDescriptionForm
//               inputText={inputText}
//               setInputText={setInputText}
//               isLoading={isLoading}
//               handleSubmit={handleSubmit}
//               imagePreviews={imagePreviews}
//               handleRemoveImage={handleRemoveImage}
//               handleImageSelect={handleImageSelect}
//             />
//             <div className="mt-5">
//               <p className="text-white font-medium mb-4 text-center">
//                 Templates
//               </p>
//               <div className="grid grid-cols-2 gap-4">
//                 {templates.map((item, index) => (
//                   <TemplateCard
//                     key={index}
//                     template={item}
//                     onClick={() =>
//                       setInputText(
//                         `Category: ${item.title}; Colors: Black, White; Fabric: ${item.fabric}; GSM: ${item.gsm}; Fit: ${item.fit}`
//                       )
//                     }
//                   />
//                 ))}
//               </div>
//             </div>
//             // Add this to Dashboard.jsx, near the templates section
//             {user && (
//               <div className="mt-6 text-center">
//                 <button
//                   onClick={() => navigate("/chat")}
//                   className="text-white border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-black transition-colors"
//                 >
//                   View Previous Chats
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* Loading Overlay */}
//       {isLoading && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
//           <div className="flex flex-col items-center">
//             {/* Heading */}
//             <div className="text-white font-medium mb-6 text-lg">
//               AI Generating Your Quote
//             </div>

//             {/* Loader with changing text */}
//             <div className="flex items-center">
//               <svg
//                 className="w-5 h-5 mr-3 animate-spin text-white"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   d="M12 4.75V6.25"
//                   stroke="currentColor"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 ></path>
//                 <path
//                   d="M12 17.75V19.25"
//                   stroke="currentColor"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 ></path>
//                 <path
//                   d="M6.75 12H5.25"
//                   stroke="currentColor"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 ></path>
//                 <path
//                   d="M18.75 12H17.25"
//                   stroke="currentColor"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 ></path>
//                 <path
//                   d="M7.5 7.5L6.5 6.5"
//                   stroke="currentColor"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 ></path>
//                 <path
//                   d="M17.5 17.5L16.5 16.5"
//                   stroke="currentColor"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 ></path>
//                 <path
//                   d="M7.5 16.5L6.5 17.5"
//                   stroke="currentColor"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 ></path>
//                 <path
//                   d="M17.5 6.5L16.5 7.5"
//                   stroke="currentColor"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 ></path>
//               </svg>

//               <div className="h-6 overflow-hidden">
//                 <div className="animate-text-cycle">
//                   <div className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-sm">
//                     Analyzing fabric patterns...
//                   </div>
//                   <div className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-sm">
//                     Processing garment design...
//                   </div>
//                   <div className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-sm">
//                     Calculating production costs...
//                   </div>
//                   <div className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-sm">
//                     Optimizing material usage...
//                   </div>
//                   <div className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-sm">
//                     Finalizing pricing tiers...
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <LoginModal />
//       {/* Modals */}
//       <QuoteResultDialog
//         isOpen={isDialogOpen}
//         handleReset={handleReset}
//         onClose={handleCloseDialog}
//         quoteData={quoteData}
//         onContactClick={() => {
//           setIsDialogOpen(false);
//           setIsContactModalOpen(true);
//         }}
//       />
//       <ContactFormModal
//         isOpen={isContactModalOpen}
//         onClose={() => setIsContactModalOpen(false)}
//         userProfile={user}
//         onSubmit={handleContactSubmit}
//         quoteData={quoteData}
//       />

//       <ToastNotification
//         show={toast.show}
//         message={toast.message}
//         type={toast.type}
//         onClose={() => setToast({ show: false, message: "", type: "" })}
//       />
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import ProductDescriptionForm from "../components/Dashboard/ProductDescriptionForm";
import { templates } from "../utils/mockTemplates";
import TemplateCard from "../components/Dashboard/TemplateCard";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ToastNotification from "../components/UI/ToastNotification";
import LoginModal from "../components/Auth/LoginModal";
import { showToast } from "../utils/helpers";

export default function Dashboard() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userId = user?._id || user?.id;
  const userCountry = user?.country || "India";

  useEffect(() => {
    if (location.state?.inputText) {
      setInputText(location.state.inputText);
    }
    if (location.state?.imagePreviews?.length) {
      setImagePreviews(location.state.imagePreviews);
    }
  }, [location.state]);

  // useEffect(() => {
  //   if (user && token && !hasDetectedCountry) {
  //     const detectCountry = async () => {
  //       try {
  //         const response = await axios.get(
  //           "https://free.freeipapi.com/api/json/"
  //         );
  //         if (response.data.countryName) {
  //           const detectedCountry = response.data.countryName;
  //           setUserCountry(detectedCountry);

  //           try {
  //             await updateUserCountry(detectedCountry);
  //             setHasDetectedCountry(true);
  //           } catch (error) {
  //             console.error("Failed to update user country", error);
  //           }
  //         }
  //       } catch (err) {
  //         console.error("Country API error:", err);
  //       }
  //     };

  //     detectCountry();
  //   }
  // }, [user, token, hasDetectedCountry, updateUserCountry]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      showToast("Please enter a product description", "error");
      return;
    }

    const goToChatWith = async ({ promptText, imgs, country }) => {
      setIsLoading(true);
      try {
        const resp = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/chat/new-chat`,
          { userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const chatId = resp.data.chatId;

        navigate("/chat", {
          state: {
            inputText: promptText,
            productImages: imgs,
            country,
            chatId,
          },
        });
      } catch (err) {
        console.error("Error creating new chat:", err);
        showToast("Failed to create chat", "error");
      } finally {
        setIsLoading(false);
      }
    };

    // If not logged in, prompt login then continue
    if (!user) {
      // Save in sessionStorage
      const cache = {
        inputText,
        imagePreviews,
        country: userCountry,
      };
      sessionStorage.setItem("pendingEstimate", JSON.stringify(cache));

      navigate("/login", { state: { from: "/dashboard" } });
      return;
    }

    // Logged in path
    await goToChatWith({
      promptText: inputText,
      imgs: productImages,
      country: userCountry,
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!inputText.trim()) {
  //     showToast("Please enter a product description", "error");
  //     return;
  //   }

  //   if (!user) {
  //     // Store form data before showing login
  //     const formData = {
  //       inputText,
  //       productImages,
  //       userCountry,
  //     };

  //     promptLogin(async () => {
  //       // After login, create a new chat and redirect to history
  //       try {
  //         const response = await axios.post(
  //           `${import.meta.env.VITE_BACKEND_URL}/api/chat/new-chat`,
  //           { userId: user.id },
  //           {
  //             headers: {
  //               Authorization: `Bearer ${token}`,
  //             },
  //           }
  //         );

  //         const chatId = response.data.chatId;
  //         navigate(`/chat`, {
  //           state: {
  //             inputText: formData.inputText,
  //             productImages: formData.productImages,
  //             country: formData.userCountry,
  //             chatId: chatId,
  //           },
  //         });
  //       } catch (error) {
  //         console.error("Error creating new chat:", error);
  //         showToast("Failed to create chat", "error");
  //       }
  //     });
  //     return;
  //   }

  //   // If user is logged in, proceed to create chat and redirect
  //   try {
  //     const response = await axios.post(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/chat/new-chat`,
  //       { userId: user.id },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     const chatId = response.data.chatId;
  //     navigate("/chat", {
  //       state: {
  //         inputText: inputText,
  //         productImages: productImages,
  //         country: userCountry,
  //         chatId: chatId,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Error creating new chat:", error);
  //     showToast("Failed to create chat", "error");
  //   }
  // };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const MAX_FILES = 2;
    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (productImages.length + files.length > MAX_FILES) {
      showToast(`You can only upload up to ${MAX_FILES} images.`, "error");
      e.target.value = "";
      return;
    }

    const validFiles = [];
    const validationErrors = [];

    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        validationErrors.push("Only JPEG, PNG, and WebP images are allowed.");
        return;
      }

      if (file.size > MAX_SIZE) {
        validationErrors.push("Each file must be under 5MB.");
        return;
      }

      validFiles.push(file);
    });

    if (validationErrors.length > 0) {
      showToast(validationErrors[0], "error");
      e.target.value = "";
      return;
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    const previewPromises = validFiles.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(previewPromises).then((newPreviews) => {
      setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 2));
      setProductImages((prev) => [...prev, ...validFiles].slice(0, 2));
    });

    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    const newImages = [...productImages];
    const newPreviews = [...imagePreviews];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setProductImages(newImages);
    setImagePreviews(newPreviews);
  };

  return (
    <div>
      {/* Hero */}
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:min-h-[75vh] md:justify-center pt-20 sm:pt-8 md:pt-0">
          {/* Hero */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-medium text-[#060A21] dark:text-white">
              Hi, there <span aria-hidden>👋</span>
            </h2>
            <p className="mt-2 text-[#060A21]/70 dark:text-white text-sm font-light pb-5">
              Let’s turn your product idea into reality — just tell me what you
              have in mind.
            </p>
          </div>
          {/* Top: Templates (only 3, like quick suggestions) */}
          {/* <div className="max-w-4xl mx-auto">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-[#060A21] dark:text-gray-200">
            Suggested templates
          </p>
        </div>

        Horizontal scroll on mobile, grid on md+
        <div className="md:hidden">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-3">
            {templates.slice(0, 3).map((item, idx) => (
              <div key={idx} className="snap-start shrink-0 w-[88%] max-w-sm">
                <TemplateCard
                  template={item}
                  onClick={() =>
                    setInputText(
                      `Category: ${item.title}; Colors: Black, White; Fabric: ${item.fabric}; GSM: ${item.gsm}; Fit: ${item.fit}`
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:grid grid-cols-3 gap-4">
          {templates.slice(0, 3).map((item, idx) => (
            <TemplateCard
              key={idx}
              template={item}
              onClick={() =>
                setInputText(
                  `Category: ${item.title}; Colors: Black, White; Fabric: ${item.fabric}; GSM: ${item.gsm}; Fit: ${item.fit}`
                )
              }
            />
          ))}
        </div>
      </div> */}

          {/* Form wrapper */}
          <div className="mt-5 sm:mt-6">
            <ProductDescriptionForm
              inputText={inputText}
              setInputText={setInputText}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
              imagePreviews={imagePreviews}
              handleRemoveImage={handleRemoveImage}
              handleImageSelect={handleImageSelect}
            />
          </div>

          <div className="h-10 sm:h-12 md:h-0" />
        </div>
      </div>
      {/* Toasts & Auth */}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />
      <LoginModal />
    </div>
  );
}
