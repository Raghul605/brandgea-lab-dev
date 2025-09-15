import React from "react";
import Message from "./Message";
import InputArea from "./InputArea";

export default function ChatArea({
  messages,
  isLoading,
  inputText,
  setInputText,
  handleSendMessage,
  handleGenerateQuote,
  chatContainerRef,
  imagePreviews,
  handleRemoveImage,
  handleImageSelect,
  fileInputRef,
  isChatCompleted, 
  handlePurchaseManufacturerList
}) {
  return (
    <>
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-2  sm:p-4 rounded-2xl bg-[#FAFAFA] dark:bg-black space-y-4"
      >
        {messages.map((message, index) => (
          <Message
            key={`${message.id}-${index}`}
            message={message}
            // onGenerateQuote={handleGenerateQuote}
            // onPurchaseManufacturerList={handlePurchaseManufacturerList}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl p-4 max-w-xs">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <InputArea
        inputText={inputText}
        setInputText={setInputText}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        imagePreviews={imagePreviews}
        handleRemoveImage={handleRemoveImage}
        handleImageSelect={handleImageSelect}
        fileInputRef={fileInputRef}
        isChatCompleted={isChatCompleted}
      />
    </>
  );
}
