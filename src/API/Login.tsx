// src/API/Login.tsx
import { Dispatch, SetStateAction } from "react";
import client from "./client.tsx";

export const login = async (
  username: string,
  password: string,
  setError: Dispatch<SetStateAction<string>>
): Promise<string | null> => {
  try {
    const response = await client.post<{ access: string }>("/api/token/", {
      username,
      password,
    });

    if (response.status === 200) {
      const accessToken: string = response.data.access;
      localStorage.setItem("authToken", accessToken);
      return accessToken;
    }
    return null;
  } catch (error: any) {
    if (error.response) {
      const status: number = error.response.status;
      switch (status) {
        case 400:
          setError("リクエストが不正です。入力内容を確認してください。");
          break;
        case 401:
          setError(
            "認証に失敗しました。ユーザー名またはパスワードを確認してください。"
          );
          break;
        case 403:
          setError("アクセス権限がありません。");
          break;
        case 500:
        default:
          setError(
            "サーバーエラーが発生しました。しばらくしてから再度お試しください。"
          );
          break;
      }
    } else {
      setError("ネットワークエラーが発生しました。接続を確認してください。");
    }
    return null;
  }
};
