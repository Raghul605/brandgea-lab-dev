import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState(null);

  const loginPromiseRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedExpiry = localStorage.getItem("tokenExpiry");

    if (storedUser && storedToken && storedExpiry) {
      const expiryTime = new Date(storedExpiry);
      if (expiryTime > new Date()) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } else {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData, newToken) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1); // 24-hour expiry

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", newToken);
    localStorage.setItem("tokenExpiry", expiry.toISOString());
    setUser(userData);
    setToken(newToken);
    setShowLoginModal(false);

    if (loginPromiseRef.current) {
      loginPromiseRef.current.resolve();
      loginPromiseRef.current = null;
    }

    if (loginRedirect) {
      loginRedirect();
      setLoginRedirect(null);
    }

  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    setUser(null);
    setToken(null);

    //window.location.href = "https://www.brandgea.com";
  };

  const updateMobileNumber = async (mobile) => {
    if (!user || !token) throw new Error("Not authenticated");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL || ""}/api/auth/update-mobile`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mobile }),
      }
    );

    const data = await response.json();

    if (!response.ok)
      throw new Error(data.error || "Failed to update mobile number");

    const updatedUser = { ...user, mobile: data.user.mobile };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return data.user.mobile;
  };

  const updateUserCountry = async (country) => {
    if (!user || !token) throw new Error("Not authenticated");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || ""}/api/auth/update-country`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ country }), // Ensure this is properly formatted
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update country");
      }

      const updatedUser = { ...user, country: data.user.country };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return data.user.country;
    } catch (error) {
      console.error("Update country error:", error);
      throw error;
    }
  };

  const promptLogin = useCallback((redirectAction) => {
    setLoginRedirect(() => redirectAction);
    setShowLoginModal(true);
  }, []);

  const waitForLogin = () => {
    return new Promise((resolve, reject) => {
      loginPromiseRef.current = { resolve, reject };
      if (token) {
        resolve();
        loginPromiseRef.current = null;
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateMobileNumber,
        updateUserCountry,
        showLoginModal,
        setShowLoginModal,
        promptLogin,
        waitForLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
