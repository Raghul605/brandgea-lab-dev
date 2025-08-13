import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function GoogleLoginButton() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);


      // Send user data to backend for verification/storage
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: credentialResponse.credential }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const userData = {
        id: data.user._id,
        name: data.user.name ?? decoded.name,
        email: data.user.email ?? decoded.email,
        picture: data.user.picture ?? decoded.picture,
        country: "India",
        mobile: data.user.mobile ?? null,
        };
        login(userData, data.token);
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Login Failed")}
        useOneTap
        auto_select
        theme="filled_black"
        size="large"
        text="signin_with"
      />
    </div>
  );
}
