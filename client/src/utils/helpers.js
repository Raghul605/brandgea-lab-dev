export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

export const showToast = (setToast, message, type = "info") => {
  setToast({ show: true, message, type });
  setTimeout(() => setToast({ show: false, message: "", type: "" }), 5000);
};

export const formatCurrency = (amount, currency = "INR") => {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n.toLocaleString("en-IN")} ${currency}`;
  }
};