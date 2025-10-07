// import { useState, useEffect } from "react";
// import { GoogleLogin } from "@react-oauth/google";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

// export default function GoogleLoginButton({onSuccess, onError}) {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [isMounted, setIsMounted] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//     return () => setIsMounted(false);
//   }, []);

//   const handleSuccess = async (credentialResponse) => {
//     if (!isMounted) return;
    
//     try {
//       const decoded = jwtDecode(credentialResponse.credential);
      
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
//         {
//           method: "POST",
//           headers: { 
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ token: credentialResponse.credential }),
//           // credentials: "include",
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       if (isMounted) {
//         const userData = {
//           id: data.user._id,
//           name: data.user.name ?? decoded.name,
//           email: data.user.email ?? decoded.email,
//           picture: data.user.picture ?? decoded.picture,
//           country: "India",
//           mobile: data.user.mobile ?? null,
//         };
//         login(userData, data.token);

//         onSuccess?.();
//         navigate("/dashboard", { replace: true });
//       }
//     } catch (error) {
//       console.error("Login failed:", error);
//       if (onError) onError(error.message || "Google login failed. Please try again.");
//     }
//   };

//   return (
//     <div className="flex justify-center">
//       {isMounted && (
//         <GoogleLogin
//           onSuccess={handleSuccess}
//           onError={() =>
//             onError
//               ? onError("Google login failed. Please try again.")
//               : console.log("Login Failed")
//           }
//           theme="filled_blue"
//           size="large"
//           text="signin_with"
//           shape="rectangular"
//         />
//       )}
//     </div>
//   );
// }

// GoogleLogin.jsx
import { useRef, useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function GoogleLoginButton({ onSuccess, onError }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const inFlightRef = useRef(false); // <- guard

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleSuccess = async (credentialResponse) => {
    if (!isMounted || inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: credentialResponse.credential }),
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      // Trust server values; don’t re-decode if you don’t need to.
      login(
        {
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          picture: data.user.picture,
          country: data.user.country,
          mobile: data.user.mobile ?? null,
        },
        data.token
      );

      onSuccess?.();
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      onError?.(error.message || "Google login failed. Please try again.");
    } finally {
      inFlightRef.current = false;
    }
  };

  return (
    <div className="flex justify-center">
      {isMounted && (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() =>
            onError?.("Google login failed. Please try again.")
          }
          text="signin_with" 
          theme="filled_blue"
          size="large"
          shape="rectangular"
        />
      )}
    </div>
  );
}
