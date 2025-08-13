const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// export const sendQuoteEmail = async (email, inputText, quoteData) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/email/quote`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email, inputText, quoteData }),
//     });

//     if (!response.ok) {
//       throw new Error('Failed to send quote email');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Quote email sending error:', error);
//     throw error;
//   }
// };

export const sendManufacturingEmail = async (formData, chatId) => {
  const response = await fetch(`${API_BASE_URL}/api/email/manufacturing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formData, chat_id: chatId || null }), // <—
  });

  if (!response.ok) throw new Error("Failed to send manufacturing emails");
  return await response.json();
};