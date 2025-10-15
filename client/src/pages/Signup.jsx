import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getDeviceInfo } from "../utils/deviceInfo";
import { messages, validators } from "../utils/helpers";

const BASE = import.meta.env.VITE_BACKEND_URL;
const DELIVERY_METHOD = "sms";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // ---- Sign up form (step 1) ----
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("+91");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // step 2 (OTP)
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const cleanMobile = mobile.replace(/\s/g, "");

  const isNameOk = validators.isNameValid(name);
  const isMobileOk = validators.isMobileValid(mobile);
  const isEmailOk = validators.isEmailValid(email);
  const isPwdOk = validators.isPasswordValid(password);
  const isOtpOk = validators.isOtpValid(otp);

  const canSendOtp = useMemo(
    () => isNameOk && isMobileOk && isEmailOk && isPwdOk,
    [isNameOk, isMobileOk, isEmailOk, isPwdOk]
  );

  // --- SIGN UP: SEND OTP ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!canSendOtp) return setErr("Please complete all fields correctly.");

    try {
      setLoading(true);
      await axios.post(
        `${BASE}/api/auth/register`,
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          mobile: cleanMobile,
          password,
          deliveryMethod: DELIVERY_METHOD,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      setOtpStep(true);
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- SIGN UP: VERIFY OTP & CREATE SESSION ---
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!isOtpOk) return setErr(messages.otp);

    try {
      setLoading(true);
      const device = await getDeviceInfo();
      // verify
     await axios.post(
        `${BASE}/api/auth/verify-otp`,
        {
          otp: otp.trim(),
          deliveryMethod: DELIVERY_METHOD,
          identifierValue: cleanMobile,
          ...device,
        },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      // 2) auto-login (send device/browser fingerprint)
      const loginResp = await axios.post(
        `${BASE}/api/auth/login`,
        {
          mobile: cleanMobile,
          password,
          ...device,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const { sessionToken, user: userData } = loginResp.data;
      if (sessionToken && userData) {
        login(userData, sessionToken);
      }

      navigate("/dashboard");
    } catch (e2) {
      setErr(
        e2?.response?.data?.message || e2.message || "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // --- RESEND OTP ---
  const handleResendOtp = async () => {
    setErr(null);
    try {
      setLoading(true);
      await axios.post(
        `${BASE}/api/auth/resend-otp`,
        {
          identifierValue: cleanMobile,
          deliveryMethod: DELIVERY_METHOD,
        },
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (e2) {
      setErr(
        e2?.response?.data?.message || e2.message || "Failed to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

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
          {otpStep ? "Verify your number" : "Create account"}
        </h1>
        <p className="text-gray-400 text-center text-sm mt-1 mb-7">
          {otpStep
            ? "Enter the OTP you received on the voice call"
            : "Quote faster, manage smarter, grow stronger"}
        </p>
        {err && <p className="text-xs text-red-400 mb-2 text-center">{err}</p>}

        {!otpStep && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Name</label>
              <input
                className="w-full py-[12px] px-4 rounded-full bg-transparent text-gray-100 placeholder-gray-500 ring-1 ring-[#2a2b31] focus:ring-2 focus:ring-blue-500/60 outline-none text-sm"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {!isNameOk && !!name && (
                <p className="text-xs text-red-400 mt-1">{messages.name}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Mobile</label>
              <PhoneInput
                defaultCountry="in"
                value={mobile}
                onChange={setMobile}
                inputClassName="!w-full !py-[12px] !pl-4 !pr-4 !rounded-r-full !bg-transparent !text-gray-100 !placeholder-gray-500 !ring-1 !ring-[#2a2b31] !focus:ring-2 !focus:ring-blue-500/60 !border-0"
                countrySelectorStyleProps={{
                  buttonClassName:
                    "!pl-3 !pr-2  !py-[12px] !rounded-l-full !bg-transparent !text-gray-100 !ring-1 !ring-[#2a2b31] !focus:ring-2 !focus:ring-blue-500/60 !border-0 ",
                  dropdownClassName:
                    "!bg-[#0b0e13] !text-gray-100 !border !border-[#2a2b31] !shadow-xl",
                  searchInputClassName:
                    "!bg-[#0f1115] !text-gray-100 !placeholder-gray-500 !border !border-[#2a2b31]",
                  listItemClassName: "!hover:bg-[#11151b]",
                }}
              />

              {!isMobileOk && !!mobile && (
                <p className="text-xs text-red-400 mt-1">{messages.mobile}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full py-[12px] px-4 rounded-full bg-transparent text-gray-100 placeholder-gray-500 ring-1 ring-[#2a2b31] focus:ring-2 focus:ring-blue-500/60 outline-none text-sm"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {!isEmailOk && !!email && (
                <p className="text-xs text-red-400 mt-1">{messages.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full py-[12px] px-4 pr-10 rounded-full bg-transparent text-gray-100 placeholder-gray-500 ring-1 ring-[#2a2b31] focus:ring-2 focus:ring-blue-500/60 outline-none text-sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isPwdOk && !!password && (
                <p className="text-xs text-red-400 mt-1">{messages.password}</p>
              )}
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={loading || !canSendOtp}
              className="w-full py-3 rounded-full bg-[#2563eb] hover:bg-[#1e55c5] text-white font-medium  transition"
            >
              {loading ? "Sending OTP..." : "Create account"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {otpStep && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-5">
            <div>
              <input
                className="w-full py-[12px] px-4 rounded-full bg-transparent text-gray-100 placeholder-gray-500 ring-1 ring-[#2a2b31] focus:ring-2 focus:ring-blue-500/60 outline-none tracking-widest text-center"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputMode="numeric"
              />

              {!isOtpOk && !!otp && (
                <p className="text-xs text-red-400 mt-1">{messages.otp}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleResendOtp}
              className="w-full py-3 rounded-full bg-[#2a2b31] hover:bg-[#32343b] text-gray-100 font-medium transition"
            >
              {loading ? "Resending..." : "Resend OTP"}
            </button>
          </form>
        )}

        {/* Bottom Switch - hidden on OTP */}
        {!otpStep && (
          <p className="text-xs text-gray-400 mt-8 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
