import { safeLocal } from "../utils/safeStorage.tsx";
// [NEW FILE] src/Auth/token.ts
export const TOKEN_KEY: string = "authToken";

export const getToken = (): string | null => {
  const r = safeLocal.get(TOKEN_KEY);
  return r.ok ? r.value : null;
};

export const setToken = (token: string): void => {
  const r = safeLocal.set(TOKEN_KEY, token);
  if (!r.ok) {
    console.warn("Failed to store token:", r.error);
  }
};

export const clearToken = (): void => {
  safeLocal.remove(TOKEN_KEY);
};

export const isLoggedIn = (): boolean => {
  return !!getToken();
};
