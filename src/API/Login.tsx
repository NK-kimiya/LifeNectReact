import { Dispatch, SetStateAction } from "react";

// src/api/auth.ts
export const login = async (
  username: string,
  password: string,
  setError: Dispatch<SetStateAction<string>>
): Promise<string | null> => {
  try {
    const response = await fetch("http://localhost:8000/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    switch (response.status) {
      case 200: {
        const data = await response.json();
        const token = data.access;
        console.log(token);
        localStorage.setItem("authToken", token);
        window.location.href = "/admin-top";
        return token;
      }
      case 400:
        setError("入力内容が正しくありません。もう一度確認してください。");
        return null;

      case 401:
        setError("ユーザー名またはパスワードが間違っています。");
        return null;

      case 500:
      case 502:
      case 503:
        setError(
          "サーバー内部でエラーが発生しました。時間を置いて再試行してください。"
        );
        return null;

      default:
        setError(`予期しないエラーが発生しました (status: ${response.status})`);
        return null;
    }
  } catch (error) {
    console.error("ログインエラー:", error);
    setError("ネットワークエラーが発生しました。");
    return null;
  }
};
