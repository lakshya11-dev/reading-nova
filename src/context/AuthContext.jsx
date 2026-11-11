import { createContext, useContext, useState, useEffect } from "react";
import { getMyProfile } from "../api/auth";
import { getMyCart } from "../api/cart";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndCart = async () => {
    try {
      const profile = await getMyProfile();
      setUser(profile);

      // Fetch cart count for authenticated user
      try {
        const cart = await getMyCart();
        const count = cart.items ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    } catch (err) {
      console.error("Session expired or invalid token:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfileAndCart();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    return await fetchProfileAndCart();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setCartCount(0);
  };

  const refreshCart = async () => {
    if (!token) return;
    try {
      const cart = await getMyCart();
      const count = cart.items ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profile = await getMyProfile();
      setUser(profile);
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === "admin",
    cartCount,
    loading,
    login,
    logout,
    refreshCart,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

