import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";
import { useError } from "./ErrorContext.tsx";
import { getToken, setToken, clearToken, isLoggedIn } from "../Auth/token.tsx";

type AuthContextType = {
  isAuthenticated: boolean; //現在ログインしているかどうかのフラグ
  authToken: string | null; //認証用トークン（例: JWT）の実体。未ログイン時は null
  isLoggingOut: boolean; //ログアウト処理を実行中かどうかのフラグ
  loginWithToken: (token: string) => void;
  logout: (message?: string) => void;
};

const AuthContext = createContext<AuthContextType>({
  // デフォルト（実行時には Provider が上書きします）
  isAuthenticated: false,
  authToken: null,
  isLoggingOut: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  loginWithToken: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: () => {},
});

type Props = { children: ReactNode };

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(getToken());
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const navigate = useNavigate();
  const { setError } = useError();

  const loginWithToken = useCallback((token: string): void => {
    // [ADD] ログイン時、ContextとlocalStorageの両方を更新
    setToken(token);
    setAuthToken(token);
  }, []);

  const logout = useCallback(
    (message?: string): void => {
      if (isLoggingOut) return; // [ADD] 無限ループ/多重発火を抑止
      setIsLoggingOut(true);
      clearToken();
      setAuthToken(null);
      if (message) {
        setError(message);
      }
      navigate("/admin-login", { replace: true }); // ★ 認証必須ページからの離脱（履歴置換で戻れないように）
      setTimeout(() => setIsLoggingOut(false), 0); // [ADD] 次フレームで解除（同tickの2重発火を防ぐ）
    },
    [isLoggingOut, navigate, setError]
  ); //isLoggingOut, navigate, setErrorの参照が変われば、新しく生成する

  // [ADD] Axios側からの 401 通知を拾って一括ログアウト
  useEffect(() => {
    const onUnauthorized = () => {
      logout("セッションが切れました。再ログインしてください。");
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, [logout]);

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated: isLoggedIn(),
      authToken,
      isLoggingOut,
      loginWithToken,
      logout,
    }),
    [authToken, isLoggingOut, loginWithToken, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => useContext(AuthContext);
