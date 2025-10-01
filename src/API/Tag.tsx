// src/API/Tag.tsx
import axios from "axios";
import { Dispatch, SetStateAction } from "react";
const BASE_URL = "http://localhost:8000";

export const createTag = async (
  name: string,
  setError: Dispatch<SetStateAction<string>>
) => {
  try {
    // localStorage から JWTトークンを取得
    const token = localStorage.getItem("authToken");
    if (!token)
      throw new Error("認証トークンがありません。ログインしてください。");

    const response = await axios.post(
      `${BASE_URL}/api/tags/`,
      { name },
      {
        headers: {
          Authorization: `Bearer ${token}`, // トークンを付与
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          setError("入力が不正です。もう一度確認してください。");
          break;
        case 401:
          setError("認証エラーです。再ログインしてください。");
          break;
        case 403:
          setError("権限がありません。管理者のみが実行できます。");
          break;
        case 500:
        default:
          setError("サーバーでエラーが発生しました。");
      }
    } else {
      setError("ネットワークエラーが発生しました。");
    }
    throw error;
  }
};

export const fetchTags = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/tags/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data; // [{id: 1, name: "Django"}, ...]
  } catch (error: any) {
    console.error("タグ取得エラー:", error.response?.data || error.message);
    throw error;
  }
};
