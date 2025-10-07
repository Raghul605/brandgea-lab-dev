import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const BASE = import.meta.env.VITE_BACKEND_URL;

export default function ForgetPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("request"); // "request" | "verify"
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("+91");
  const [deliveryMethod, setDeliveryMethod] = useState("sms");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  async function handleForget(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      let body = { deliveryMethod };
      if (email) body.email = email;
      if (mobile) body.mobile = mobile;

      if (deliveryMethod === "sms" && !mobile) throw new Error("Enter mobile number");
      if (deliveryMethod === "email" && !email) throw new Error("Enter email address");

      setLoading(true);
      const res = await fetch(`${BASE}/api/auth/forget-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to request reset OTP");

      setSuccess("OTP sent successfully!");
      setStep("verify"); // ⬅ switch to OTP input section
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP + Reset Password
  async function handleReset(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      let body = {
        otp,
        newPassword,
        deliveryMethod,
      };
      if (email) body.email = email;
      if (mobile) body.mobile = mobile;

      setLoading(true);
      const res = await fetch(`${BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password reset failed");

      setSuccess("Password reset successful. Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0f1115] flex justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex gap-2 mt-20 sm:mt-32 mb-8 justify-center">
          <img src="/brandgea-lab-dark.svg" alt="Brandgea" className="h-8" />
          <span className="text-gray-100 text-2xl font-medium tracking-tight">
            Brandgea
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-white text-2xl text-center font-semibold">
          {step === "request" ? "Forgot Password?" : "Reset Password"}
        </h1>
        <p className="text-gray-400 text-sm text-center mt-1 mb-7">
          {step === "request"
            ? `Enter your ${deliveryMethod === "sms" ? "mobile" : "email"} to get an OTP`
            : "Enter the OTP and your new password"}
        </p>

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
        {success && <p className="text-sm text-green-400 mb-3">{success}</p>}

        {/* Step 1: Request OTP */}
        {step === "request" && (
          <form onSubmit={handleForget} className="space-y-5">
            {/* Delivery Method */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Send OTP via</label>
              <select
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                className="w-full py-[12px] px-4 rounded-full bg-transparent text-gray-100 ring-1 ring-[#2a2b31] focus:ring-2 focus:ring-blue-500/60 outline-none"
              >
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={deliveryMethod !== "email"}
                required={deliveryMethod === "email"}
                className="w-full py-[12px] px-4 rounded-full bg-transparent text-gray-100 placeholder-gray-500 ring-1 ring-[#2a2b31] focus:ring-2 focus:ring-blue-500/60 outline-none disabled:opacity-50"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Mobile</label>
              <input
                placeholder="+919876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                disabled={deliveryMethod !== "sms"}
                required={deliveryMethod === "sms"}
                className="w-full py-[12px] px-4 rounded-full bg-transparent text-gray-100 placeholder-gray-500 ring-1 ring-[#2a2b31] focus:ring-2 focus:ring-blue-500/60 outline-none disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#2563eb] hover:bg-[#1e55c5] text-white font-medium transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset OTP"}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP + New Password */}
        {step === "verify" && (
          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-gray-300 text-sm mb-1">OTP</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                inputMode="numeric"
                required
                className="w-full py-[12px] px-4 rounded-full bg-transparent text-center tracking-widest text-gray-100 placeholder-gray-500 ring-1 ring-[#2a2b31] focus:ring-2 focus:ring-blue-500/60 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full py-[12px] px-4 rounded-full bg-transparent text-gray-100 placeholder-gray-500 ring-1 ring-[#2a2b31] focus:ring-2 focus:ring-blue-500/60 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Switch */}
        {step === "request" && (
          <p className="text-xs text-gray-400 mt-8 text-center">
            Remembered your password?{" "}
            <Link to="/login" className="text-blue-400 hover:underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
