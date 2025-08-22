import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function GoogleLoginButton({onSuccess, onError}) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleSuccess = async (credentialResponse) => {
    if (!isMounted) return;
    
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: credentialResponse.credential }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (isMounted) {
        const userData = {
          id: data.user._id,
          name: data.user.name ?? decoded.name,
          email: data.user.email ?? decoded.email,
          picture: data.user.picture ?? decoded.picture,
          country: "India",
          mobile: data.user.mobile ?? null,
        };
        login(userData, data.token);

        if(onSuccess) onSuccess();
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (onError) onError(error.message || "Google login failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center">
      {isMounted && (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() =>
            onError
              ? onError("Google login failed. Please try again.")
              : console.log("Login Failed")
          }
          theme="filled_blue"
          size="large"
          text="continue_with"
          shape="rectangular"
        />
      )}
    </div>
  );
}