// src/API/Login.tsx
import { Dispatch, SetStateAction } from "react";
import client from "./client.tsx";
import { handleApiError } from "./errorHandler.tsx";
import { setToken } from "../Auth/token.tsx";
export const login = async (
  username: string,
  password: string,
  setError: Dispatch<SetStateAction<string>>
): Promise<string | null> => {
  try {
    const response = await client.post<{ access: string }>("/token/", {
      username,
      password,
    });

    const token = response.data.access;

    // ★ ローカルストレージに保存
    setToken(token);

    return token;
  } catch (error: any) {
    handleApiError(error, setError, "ログインに失敗しました。");
    return null;
  }
};
