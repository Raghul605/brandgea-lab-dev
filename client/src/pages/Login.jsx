// import { useEffect, useMemo, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { Eye, EyeOff } from "lucide-react";
// import { PhoneInput } from "react-international-phone";
// import axios from "axios";

// const BASE = import.meta.env.VITE_BACKEND_URL;
// const headers = { "Content-Type": "application/json" };
// const DELIVERY_METHOD = "sms";

// export default function Login() {
//   const { user, setUser, setToken } = useAuth();
//   const navigate = useNavigate();

//   const [tab, setTab] = useState("signin");
//   const [loading, setLoading] = useState(false);
//   const [msg, setMsg] = useState(null);
//   const [err, setErr] = useState(null);

//   // ---- Sign in form ----
//   const [inMobile, setInMobile] = useState("+91");
//   const [inPassword, setInPassword] = useState("");
//   const [showInPassword, setShowInPassword] = useState(false);

//   // ---- Sign up form (step 1) ----
//   const [name, setName] = useState("");
//   const [mobile, setMobile] = useState("+91");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showUpPassword, setShowUpPassword] = useState(false);

//   // ---- OTP step (step 2) ----
//   const [otpStep, setOtpStep] = useState(false);
//   const [otp, setOtp] = useState("");

//   useEffect(() => {
//     if (user) {
//       navigate("/dashboard");
//     }
//   }, [user, navigate]);

//   // validators
//   const isValidMobile = (val) =>
//     /^\+\d{8,15}$/.test((val || "").replace(/\s/g, ""));
//   const isValidEmail = (e) =>
//     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || "").trim().toLowerCase());

//   const canSendOtp = useMemo(
//     () =>
//       name.trim().length >= 2 &&
//       isValidMobile(mobile) &&
//       isValidEmail(email) &&
//       password.length >= 6,
//     [name, mobile, email, password]
//   );

//   const fetchMe = async (sessionToken) => {
//     try {
//       const headers = {};
//       if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
//       const me = await axios.get(`${BASE}/api/auth/me`, {
//         headers,
//         withCredentials: true,
//       });
//       if (me?.data?.user) setUser?.(me.data.user);
//     } catch {
//       /* ignore */
//     }
//   };

//   // --- SIGN IN ---
//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     setMsg(null);
//     setErr(null);

//     if (!isValidMobile(inMobile))
//       return setErr("Enter a valid 10-digit mobile number.");
//     if (inPassword.length < 6)
//       return setErr("Password must be at least 6 characters.");

//     // get device / browser info for your backend fields
//     const deviceName = navigator.platform || "web";
//     const userAgent = navigator.userAgent || "web";
//     const browser =
//       (navigator.userAgentData && navigator.userAgentData.brands?.[0]?.brand) ||
//       userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/i)?.[0] ||
//       "web";

//     try {
//       setLoading(true);
//       const resp = await axios.post(
//         `${BASE}/api/auth/login`,
//         {
//           mobile: inMobile.replace(/\s/g, ""),
//           password: inPassword,
//           deviceName,
//           browser,
//           userAgent,
//         },
//         {
//           headers: { "Content-Type": "application/json" },
//           withCredentials: true,
//         }
//       );
//       const sessionToken = resp?.data?.sessionToken;
//       if (sessionToken) setToken?.(sessionToken);
//       await fetchMe(sessionToken);
//       setMsg("Welcome back!");
//       navigate("/dashboard");
//     } catch (e2) {
//       setErr(e2?.response?.data?.message || e2.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- SIGN UP: SEND OTP ---
//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setMsg(null);
//     setErr(null);

//     if (!canSendOtp) return setErr("Please complete all fields correctly.");
//     try {
//       setLoading(true);
//       await axios.post(
//         `${BASE}/api/auth/register`,
//         {
//           name: name.trim(),
//           email: email.trim().toLowerCase(),
//           mobile: mobile.replace(/\s/g, ""),
//           password,
//           deliveryMethod: DELIVERY_METHOD, // "sms"
//         },
//         { headers: { "Content-Type": "application/json" } }
//       );
//       setMsg("OTP sent to your mobile.");
//       setOtpStep(true);
//     } catch (e2) {
//       setErr(e2?.response?.data?.message || e2.message || "Failed to send OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- SIGN UP: VERIFY OTP & CREATE SESSION ---
//   const handleVerifyAndRegister = async (e) => {
//     e.preventDefault();
//     setMsg(null);
//     setErr(null);

//     if (!/^\d{6}$/.test((otp || "").trim())) {
//       return setErr("Enter the 6 digit OTP sent to your mobile.");
//     }

//     try {
//       setLoading(true);
//       // verify
//       await axios.post(
//         `${BASE}/api/auth/verify-otp`,
//         {
//           otp: otp.trim(),
//           deliveryMethod: DELIVERY_METHOD,
//           identifierValue: mobile.replace(/\s/g, ""),
//         },
//         { headers: { "Content-Type": "application/json" } }
//       );

//       // 3) Login after verification
//       const deviceName = navigator.platform || "web";
//       const userAgent = navigator.userAgent || "web";
//       const browser =
//         (navigator.userAgentData &&
//           navigator.userAgentData.brands?.[0]?.brand) ||
//         userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/i)?.[0] ||
//         "web";

//       const loginResp = await axios.post(
//         `${BASE}/api/auth/login`,
//         {
//           mobile: mobile.replace(/\s/g, ""),
//           password,
//           deviceName,
//           browser,
//           userAgent,
//         },
//         {
//           headers: { "Content-Type": "application/json" },
//           withCredentials: true,
//         }
//       );

//       const sessionToken = loginResp?.data?.sessionToken;
//       if (sessionToken) setToken?.(sessionToken);

//       await fetchMe(sessionToken);
//       setMsg("Account created!");
//       navigate("/dashboard");
//     } catch (e2) {
//       setErr(
//         e2?.response?.data?.message || e2.message || "Verification failed"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- RESEND OTP ---
//   const handleResendOtp = async () => {
//     setMsg(null);
//     setErr(null);
//     try {
//       setLoading(true);
//       await axios.post(
//         `${BASE}/api/auth/resend-otp`,
//         {
//           identifierValue: mobile.replace(/\s/g, ""),
//           deliveryMethod: DELIVERY_METHOD,
//         },
//         { headers: { "Content-Type": "application/json" } }
//       );
//       setMsg("OTP resent.");
//     } catch (e2) {
//       setErr(
//         e2?.response?.data?.message || e2.message || "Failed to resend OTP"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-black via-[#090d16] to-[#0f172a] flex items-center justify-center px-4 text-center relative overflow-hidden">
//       {/* Background */}
//       <div className="absolute inset-0 bg-[radial-gradient(#475569_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 z-0 pointer-events-none" />

//       {/* Centered Card with Max Height */}
//       <div className="z-10 w-full max-w-md">
//         <div
//           className="bg-white/5 backdrop-blur rounded-2xl shadow-xl border border-white/10
//                         max-h-[85vh] overflow-y-auto px-6 py-7"
//         >
//           {/* Brand / Heading stays consistent height */}
//           <div className="flex flex-col items-center">
//             <span className="text-xs uppercase tracking-widest text-gray-400 px-3 py-1 border border-blue-300 rounded-full shadow-[0_0_25px_6px_rgba(76,49,251,0.3)] mb-3">
//               Powered by AI
//             </span>
//             <img src="/brandgea-lab.svg" alt="Brandgea" className="h-12 mb-2" />
//             <h1 className="text-white text-3xl font-semibold mb-1">Brandgea</h1>
//             <p className="text-gray-400 mb-5">
//               Estimate your apparel pricing before you produce.
//             </p>
//           </div>

//           {/* Tabs */}
//           <div className="flex justify-center mb-5">
//             <button
//               className={`px-4 py-2 text-sm rounded-l-full border border-gray-700 ${
//                 tab === "signin" ? "bg-white/10 text-white" : "text-gray-400"
//               }`}
//               onClick={() => {
//                 setTab("signin");
//                 setOtpStep(false);
//                 setErr(null);
//                 setMsg(null);
//               }}
//             >
//               Sign In
//             </button>
//             <button
//               className={`px-4 py-2 text-sm rounded-r-full border border-gray-700 border-l-0 ${
//                 tab === "signup" ? "bg-white/10 text-white" : "text-gray-400"
//               }`}
//               onClick={() => {
//                 setTab("signup");
//                 setOtpStep(false);
//                 setErr(null);
//                 setMsg(null);
//               }}
//             >
//               Create Account
//             </button>
//           </div>

//           {/* Messages */}
//           {err && <div className="mb-3 text-sm text-red-400">{err}</div>}
//           {msg && <div className="mb-3 text-sm text-emerald-400">{msg}</div>}

//           {/* Sign In */}
//           {tab === "signin" && (
//             <form onSubmit={handleSignIn} className="text-left">
//               <label className="block text-gray-300 text-sm mb-1">Mobile</label>
//               <div className="mb-4">
//                 <PhoneInput
//                   defaultCountry="in"
//                   value={inMobile}
//                   onChange={setInMobile}
//                   inputClassName="!bg-black/40 !text-white !border !border-gray-700 !rounded-r-lg !w-full !py-2"
//                   countrySelectorStyleProps={{
//                     buttonClassName:
//                       "!bg-black/40 !text-white !border-r !border-gray-700 !rounded-l-lg",
//                     dropdownClassName:
//                       "!bg-[#0b1220] !text-gray-100 !border !border-gray-700 !shadow-xl",
//                     searchInputClassName:
//                       "!bg-gray-900 !text-white !placeholder-gray-400 !border !border-gray-700",
//                     listItemClassName: "!hover:bg-gray-900",
//                   }}
//                 />
//               </div>

//               <label className="block text-gray-300 text-sm mb-1">
//                 Password
//               </label>
//               <div className="relative mb-6">
//                 <input
//                   className="w-full px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-white pr-10"
//                   placeholder="Your password"
//                   type={showInPassword ? "text" : "password"}
//                   value={inPassword}
//                   onChange={(e) => setInPassword(e.target.value)}
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
//                   onClick={() => setShowInPassword((s) => !s)}
//                   aria-label={
//                     showInPassword ? "Hide password" : "Show password"
//                   }
//                 >
//                   {showInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>

//               <div className="flex items-center justify-between mb-4">
//                 <span />
//                 <Link
//                   to="/forgot-password"
//                   className="text-xs text-blue-300 hover:underline"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>

//               <button
//                 disabled={loading}
//                 className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
//               >
//                 {loading ? "Signing in..." : "Sign In"}
//               </button>
//             </form>
//           )}

//           {/* Sign Up */}
//           {tab === "signup" && !otpStep && (
//             <form onSubmit={handleSendOtp} className="text-left">
//               <label className="block text-gray-300 text-sm mb-1">Name</label>
//               <input
//                 className="w-full mb-4 px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-white"
//                 placeholder="Your full name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />

//               <label className="block text-gray-300 text-sm mb-1">
//                 Mobile *
//               </label>
//               <div className="mb-4">
//                 <PhoneInput
//                   defaultCountry="in"
//                   value={mobile}
//                   onChange={setMobile}
//                   inputClassName="!bg-black/40 !text-white !border !border-gray-700 !rounded-r-lg !w-full !py-2"
//                   countrySelectorStyleProps={{
//                     buttonClassName:
//                       "!bg-black/40 !text-white !border-r !border-gray-700 !rounded-l-lg",
//                     dropdownClassName:
//                       "!bg-[#0b1220] !text-gray-100 !border !border-gray-700 !shadow-xl",
//                     searchInputClassName:
//                       "!bg-gray-900 !text-white !placeholder-gray-400 !border !border-gray-700",
//                     listItemClassName: "!hover:bg-gray-900",
//                   }}
//                 />
//               </div>

//               <label className="block text-gray-300 text-sm mb-1">Email</label>
//               <input
//                 className="w-full mb-4 px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-white"
//                 placeholder="your@email.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 type="email"
//               />

//               <label className="block text-gray-300 text-sm mb-1">
//                 Password
//               </label>
//               <div className="relative mb-6">
//                 <input
//                   className="w-full px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-white pr-10"
//                   placeholder="Min 6 characters"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   type={showUpPassword ? "text" : "password"}
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
//                   onClick={() => setShowUpPassword((s) => !s)}
//                   aria-label={
//                     showUpPassword ? "Hide password" : "Show password"
//                   }
//                 >
//                   {showUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading || !canSendOtp}
//                 className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-60"
//               >
//                 {loading ? "Sending OTP..." : "Sign up"}
//               </button>
//             </form>
//           )}

//           {/* OTP Step */}
//           {tab === "signup" && otpStep && (
//             <form onSubmit={handleVerifyAndRegister} className="text-left">
//               <p className="text-gray-300 text-sm mb-3">
//                 Enter the OTP sent to{" "}
//                 <span className="font-medium">{mobile}</span>
//               </p>
//               <input
//                 className="w-full mb-6 px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-white tracking-widest text-center"
//                 placeholder="Enter OTP"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 inputMode="numeric"
//               />
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
//               >
//                 {loading ? "Verifying..." : "Verify & Create Account"}
//               </button>
//               <button
//                 type="button"
//                 className="w-full mt-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition"
//                 disabled={loading}
//                 onClick={handleResendOtp}
//               >
//                 Resend OTP
//               </button>
//             </form>
//           )}

//           <p className="text-xs text-gray-500 mt-6">
//             By continuing, you agree to our{" "}
//             <a
//               className="underline"
//               href="https://brandgea.com/terms-of-service"
//               target="_blank"
//               rel="noreferrer"
//             >
//               Terms
//             </a>{" "}
//             &{" "}
//             <a
//               className="underline"
//               href="https://brandgea.com/privacy-policy"
//               target="_blank"
//               rel="noreferrer"
//             >
//               Privacy Policy
//             </a>
//             .
//           </p>
//         </div>
//       </div>

//       {/* bottom glow */}
//       <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#0f172a] to-transparent blur-2xl opacity-60" />
//     </div>
//   );
// }

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getDeviceInfo } from "../utils/deviceInfo";

const BASE = import.meta.env.VITE_BACKEND_URL;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginMethod, setLoginMethod] = useState("email"); // default = email
  const [mobile, setMobile] = useState("+91");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [remember, setRemember] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErr(null);

    try {
      setLoading(true);
      const device = await getDeviceInfo();

      const payload =
        loginMethod === "mobile"
          ? { mobile: mobile.replace(/\s/g, ""), password, ...device }
          : { email: email.trim().toLowerCase(), password, ...device };

      const resp = await axios.post(`${BASE}/api/auth/login`, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const { sessionToken, user: userData } = resp.data;
      if (sessionToken && userData) {
        login(userData, sessionToken, remember);
      }

      // Redirect back with cache if available
      if (location.state?.from === "/dashboard") {
        const cache = JSON.parse(
          sessionStorage.getItem("pendingEstimate") || "{}"
        );

        navigate("/dashboard", { state: cache });

        sessionStorage.removeItem("pendingEstimate"); // cleanup
      } else {
        navigate("/dashboard");
      }
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message || "Login failed");
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
          Welcome Back!
        </h1>
        <p className="text-gray-400 text-sm text-center mt-1 mb-7">
          Ready to step up your style? Log in now!
        </p>

        <form onSubmit={handleSignIn} className="space-y-5">
          {/* Email or Mobile */}
          {loginMethod === "email" ? (
            <div>
              <label className="block text-gray-300 text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full py-[12px] px-4 rounded-full bg-transparent text-gray-100 placeholder-gray-500 ring-1 ring-[#2a2b31] focus:ring-2 focus:ring-blue-500/60 outline-none text-sm"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className="block text-gray-300 text-sm mb-1">Mobile</label>
              <PhoneInput
                defaultCountry="in"
                value={mobile}
                onChange={setMobile}
                inputClassName="!w-full !py-[12px] !pl-4 !pr-4 !rounded-r-full !bg-transparent !text-gray-100 !placeholder-gray-500 !ring-1 !ring-[#2a2b31] !focus:ring-2 !focus:ring-blue-500/60 !border-0"
                countrySelectorStyleProps={{
                  buttonClassName:
                    "!pl-3 !pr-2 !rounded-l-full !bg-transparent !text-gray-100 !ring-1 !ring-[#2a2b31] !focus:ring-2 !focus:ring-blue-500/60 !border-0",
                  dropdownClassName:
                    "!bg-[#0b0e13] !text-gray-100 !border !border-[#2a2b31] !shadow-xl",
                  searchInputClassName:
                    "!bg-[#0f1115] !text-gray-100 !placeholder-gray-500 !border !border-[#2a2b31]",
                  listItemClassName: "!hover:bg-[#11151b]",
                }}
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">Password</label>
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
          </div>

          {err && <p className="text-red-400 text-sm text-center">{err}</p>}

          {/* Toggle between email & mobile */}
          <div className="text-sm text-center text-blue-400 cursor-pointer hover:underline">
            {loginMethod === "email" ? (
              <span onClick={() => setLoginMethod("mobile")}>
                Use mobile number to login
              </span>
            ) : (
              <span onClick={() => setLoginMethod("email")}>
                Use email to login
              </span>
            )}
          </div>

          {/* Row: remember + forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-400 select-none">
              <input
                type="checkbox"
                className="accent-blue-600 w-4 h-4"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-blue-400 hover:underline"
            >
              Forgot password
            </Link>
          </div>

          {/* CTA */}
          <button
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#2563eb] hover:bg-[#1e55c5] text-white font-medium transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Switch */}
        <p className="text-xs text-gray-400 mt-8 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
