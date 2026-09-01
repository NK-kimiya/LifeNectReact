"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

//型の定義
type AuthContextType = {
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStorageItem = (key: string) => {
    if (typeof window === "undefined") {
      return null;
    }
  
    return localStorage.getItem(key);
  };

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
    const [accessToken, setAccessToken] = useState<string | null>(() =>
        getStorageItem("accessToken"),
    );
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    getStorageItem("refreshToken"),
  );

  const login = (newAccessToken: string, newRefreshToken: string) => {
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setAccessToken(null);
    setRefreshToken(null);
  };

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      isLoggedIn: Boolean(accessToken),
      login,
      logout,
    }),
    [accessToken, refreshToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {//外部ファイルから参照
  const context = useContext(AuthContext);//useContext を使って、AuthContext に入っている値を取得

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}