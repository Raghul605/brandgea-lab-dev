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

// ---------- REGEX PATTERNS ----------
export const regex = {
  name: /^[A-Za-z][A-Za-z\s'.-]{1,39}$/, // 2–40 letters, allows spaces and a few safe symbols
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,   // standard email
  intlMobile: /^\+\d{10,15}$/,           // e.g. +919876543210
  otp4: /^\d{4}$/,                       // 6-digit OTP
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*().,_-]{8,20}$/ // 8–20 chars, must have at least one letter and one number
};

// ---------- VALIDATION HELPERS ----------
export const validators = {
  isNameValid: (val = "") => regex.name.test(val.trim()),
  isEmailValid: (val = "") => regex.email.test(val.trim().toLowerCase()),
  isMobileValid: (val = "") => regex.intlMobile.test(val.replace(/\s/g, "")),
  isOtpValid: (val = "") => regex.otp4.test(val.trim()),
  isPasswordValid: (val = "") => regex.password.test(val)
};

// ---------- ERROR MESSAGES ----------
export const messages = {
  name: "Name must be 2–40 letters (spaces and basic punctuation allowed).",
  email: "Enter a valid email address.",
  mobile: "Use international format, e.g. +919876543210.",
  otp: "OTP must be exactly 4 digits.",
  password:
    "Password must be 8–20 characters long and include at least 1 letter and 1 number."
};