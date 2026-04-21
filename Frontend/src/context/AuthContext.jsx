import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get("/auth/me", { skipAuthRedirect: true });
      setUser(response.data);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response.data;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await api.post("/auth/register", payload);
    if (response.data?.user) {
      setUser(response.data.user);
      setIsAuthenticated(true);
    }
    return response.data;
  }, []);

  const verifyRegistrationCode = useCallback(async ({ email, code }) => {
    const response = await api.post(
      "/auth/verify-registration-code",
      { email, code },
      { skipAuthRedirect: true }
    );
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response.data;
  }, []);

  const resendRegistrationCode = useCallback(async (email) => {
    const response = await api.post(
      "/auth/resend-registration-code",
      { email },
      { skipAuthRedirect: true }
    );
    return response.data;
  }, []);

  const checkEmailAvailability = useCallback(async (email) => {
    const response = await api.post("/auth/check-email", { email }, { skipAuthRedirect: true });
    return response.data;
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const response = await api.post(
      "/auth/forgot-password",
      { email },
      { skipAuthRedirect: true }
    );
    return response.data;
  }, []);

  const resetPassword = useCallback(async ({ token, password }) => {
    const response = await api.post(
      "/auth/reset-password",
      { token, password },
      { skipAuthRedirect: true }
    );
    return response.data;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const response = await api.patch("/auth/me/profile", payload);
    setUser(response.data.user);
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      authLoading,
      login,
      register,
      verifyRegistrationCode,
      resendRegistrationCode,
      checkEmailAvailability,
      forgotPassword,
      resetPassword,
      updateProfile,
      logout,
      checkAuth,
    }),
    [
      authLoading,
      checkAuth,
      checkEmailAvailability,
      forgotPassword,
      isAuthenticated,
      login,
      logout,
      register,
      resendRegistrationCode,
      resetPassword,
      updateProfile,
      verifyRegistrationCode,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
