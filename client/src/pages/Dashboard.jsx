// src/pages/Dashboard.jsx
import React, { useEffect } from "react";
import { useState } from "react";
import Header from "../components/Layout/Header";
import ProductDescriptionForm from "../components/Dashboard/ProductDescriptionForm";
import { templates } from "../utils/mockTemplates";
import TemplateCard from "../components/Dashboard/TemplateCard";
import ImageAttachmentModal from "../components/Dashboard/ImageAttachmentModal";
import QuoteResultDialog from "../components/Dashboard/QuoteResultDialog";
import { useAuth } from "../context/AuthContext";
import ContactFormModal from "../components/Dashboard/ContactFormModal";
import { sendManufacturingEmail } from "../utils/emailService";
import axios from "axios";

export default function Dashboard() {
  const [inputText, setInputText] = useState("");
  const [quoteData, setQuoteData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const { user, updateMobileNumber, token } = useAuth();

  const [userCountry, setUserCountry] = useState("India");
  const [countryLoading, setCountryLoading] = useState(false);
  const [countryError, setCountryError] = useState("");

    useEffect(() => {
    const detectCountry = async () => {
      try {
        setCountryLoading(true);
        const response = await axios.get('https://free.freeipapi.com/api/json/');
        if (response.data.countryName) {
          setUserCountry(response.data.countryName);
        } else {
          setCountryError("Country detection failed");
        }
      } catch (err) {
        console.error("Country API error:", err);
        setCountryError("Network error - using default country");
      } finally {
        setCountryLoading(false);
      }
    };

    detectCountry();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please sign in again.");
      return;
    }
    if (!inputText.trim() || productImages.length === 0) {
      alert("Please enter description and attach at least one image");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("prompt", inputText);
      formData.append("country", userCountry);

      // Append all selected images
      productImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/clothing/validate`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Parse response data directly
      const data = response.data;

      // Handle API errors
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.match === false) {
        throw new Error(data.reason || "Garment type mismatch");
      }
      const { manufacturing_costs } = data;
      const { currency = "INR", ...costs } = manufacturing_costs || {};
      const pricing = Object.entries(costs).reduce((acc, [qty, unitPrice]) => {
        const priceNum = Number(unitPrice);
        if (Number.isFinite(priceNum)) {
          acc[String(qty)] = { price: priceNum, currency };
        }
        return acc;
      }, {});

      setQuoteData({
        message: "Feasible for production! See pricing below",
        pricing,
        updatedCosts: manufacturing_costs,
        sanitizedInput: inputText,
        country: userCountry,
      });
      setIsDialogOpen(true);
      setSubmitError("");
    } catch (error) {
      const api = error.response?.data;
      const serverMsg =
        api?.message || api?.reason || api?.error || error.message;
      setSubmitError(serverMsg);

      console.error("Quote generation failed:", error.response?.data || error);
     
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputText("");
    setIsDialogOpen(false);
    setProductImages([]);
    setImagePreviews([]);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    handleReset();
  };
const handleImageSelect = (e) => {
  const files = Array.from(e.target.files);
  const sliced = files.slice(0, 2);

  const newImages = [];
  const newPreviews = [];

  sliced.forEach((file) => {
    if (productImages.length >= 2) return;

    
    newImages.push(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      newPreviews.push(reader.result);
      if (newPreviews.length === sliced.length) {
        setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 2));
        setProductImages((prev) => [...prev, ...newImages].slice(0, 2));
      }
    };
    reader.readAsDataURL(file);
  });

  setIsImageModalOpen(false);
};

  const handleRemoveImage = (index) => {
    const newImages = [...productImages];
    const newPreviews = [...imagePreviews];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setProductImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleContactSubmit = async (formData) => {
    try {
      // 1. Update user mobile number
      if (formData.mobile && formData.mobile !== (user?.mobile || "")) {
        await updateMobileNumber(formData.mobile);
      }

      // 2. Send emails
      await sendManufacturingEmail(formData);

      setContactStatus("success");
      setTimeout(() => {
        setIsContactModalOpen(false);
        setContactStatus(null);
      }, 2000);
      handleReset();
    } catch (error) {
      console.error("Contact request failed:", error);
      setContactStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#030509]">
      <Header />

      <main className="py-2 px-4">
        <div className="rounded-xl overflow-hidden">
          <div className="p-4 text-center">
            <h2 className="text-3xl font-bold text-gray-200">
              AI-Powered Apparel Quotation
            </h2>
            <p className="text-gray-400 mt-2">
              Describe your product in detail and get an instant quote
            </p>
          </div>

          <div className="p-6 max-w-4xl mx-auto">
            <ProductDescriptionForm
              inputText={inputText}
              setInputText={setInputText}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
              imagePreviews={imagePreviews}
              handleRemoveImage={handleRemoveImage}
              setIsImageModalOpen={setIsImageModalOpen}
              errorText={submitError}   
            />

            <div className="mt-5">
              <p className="text-white font-medium mb-4 text-center">
                Templates
              </p>
              <div className="grid grid-cols-2 gap-4">
                {templates.map((item, index) => (
                  <TemplateCard
                    key={index}
                    template={item}
                    onClick={() =>
                      setInputText(
                        `Category: ${item.title}; Product Name: Premium ${item.title}; Colors: Black, White; Fabric: ${item.fabric}; GSM: ${item.gsm}; Fit: ${item.fit}`
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="text-white text-xl font-semibold bg-gray-900 px-6 py-4 rounded-lg shadow-lg">
            Generating Quote...
          </div>
        </div>
      )}

      {/* Modals */}
      <ImageAttachmentModal
        isOpen={isImageModalOpen}
        setIsOpen={setIsImageModalOpen}
        handleImageSelect={handleImageSelect}
      />

      <QuoteResultDialog
        isOpen={isDialogOpen}
        handleReset={handleReset}
        onClose={handleCloseDialog}
        quoteData={quoteData}
        onContactClick={() => {
          setIsDialogOpen(false);
          setIsContactModalOpen(true);
        }}
      />

      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        userProfile={user}
        onSubmit={handleContactSubmit}
        quoteData={quoteData}
      />
      {/* Contact Status Indicator */}
      {contactStatus && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className="p-4 rounded-lg shadow-lg  bg-black text-white">
            {contactStatus === "success"
              ? "Request submitted successfully!"
              : "Failed to submit request. Please try again."}
          </div>
        </div>
      )}

    </div>
  );
}
