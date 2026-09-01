"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

type AdminAuthContextType = {
  adminAccessToken: string | null;
  adminRefreshToken: string | null;
  isAdminLoggedIn: boolean;
  adminLogin: (accessToken: string, refreshToken: string) => void;
  adminLogout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

const getStorageItem = (key: string) => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(key);
};

export function AdminAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adminAccessToken, setAdminAccessToken] = useState<string | null>(() =>
    getStorageItem("adminAccessToken"),
  );

  const [adminRefreshToken, setAdminRefreshToken] = useState<string | null>(() =>
    getStorageItem("adminRefreshToken"),
  );

  const adminLogin = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("adminAccessToken", accessToken);
    localStorage.setItem("adminRefreshToken", refreshToken);

    setAdminAccessToken(accessToken);
    setAdminRefreshToken(refreshToken);
  };

  const adminLogout = () => {
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");

    setAdminAccessToken(null);
    setAdminRefreshToken(null);
  };

  const value = useMemo(
    () => ({
      adminAccessToken,
      adminRefreshToken,
      isAdminLoggedIn: Boolean(adminAccessToken),
      adminLogin,
      adminLogout,
    }),
    [adminAccessToken, adminRefreshToken],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}