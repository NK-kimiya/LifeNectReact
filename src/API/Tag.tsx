// src/API/Tag.tsx
import { Dispatch, SetStateAction } from "react";
import client from "./client.tsx";

export type Tag = {
  id: number;
  name: string;
};

// タグ作成（認証必須）
export const createTag = async (
  name: string,
  setError: Dispatch<SetStateAction<string>>
): Promise<Tag | null> => {
  try {
    const response = await client.post<Tag>(
      "/api/tags/",
      { name },
      { headers: { Authorization: "" } } // interceptorsで付与される
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const status: number = error.response.status;
      switch (status) {
        case 400:
          setError("タグ名が不正です。");
          break;
        case 401:
          setError("認証エラー。ログインしてください。");
          break;
        case 403:
          setError("タグを作成する権限がありません。");
          break;
        case 500:
        default:
          setError("タグ作成中にサーバーエラーが発生しました。");
          break;
      }
    } else {
      setError("ネットワークエラーが発生しました。");
    }
    return null;
  }
};

// タグ一覧取得（認証不要）
export const fetchTags = async (
  setError: Dispatch<SetStateAction<string>>
): Promise<Tag[]> => {
  try {
    const response = await client.get<Tag[]>("/api/tags/", {
      headers: { Authorization: "none" }, // 認証不要を明示
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const status: number = error.response.status;
      switch (status) {
        case 404:
          setError("タグが見つかりませんでした。");
          break;
        case 500:
        default:
          setError("タグ取得中にサーバーエラーが発生しました。");
          break;
      }
    } else {
      setError("ネットワークエラーが発生しました。");
    }
    return [];
  }
};
