import React, { createContext, useContext, useState, useCallback } from "react";
import api, { getErrorMessage } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("lexirag_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("lexirag_token", data.token);
      localStorage.setItem("lexirag_user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("lexirag_token", data.token);
      localStorage.setItem("lexirag_user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      return { success: true, message: data.message, simulated: data.simulated, resetUrl: data.resetUrl };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", { token, newPassword });
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("lexirag_token");
    localStorage.removeItem("lexirag_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
