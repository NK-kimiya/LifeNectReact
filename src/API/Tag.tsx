// src/API/Tag.tsx
import { Dispatch, SetStateAction } from "react";
import client from "./client.tsx";
import { handleApiError } from "./errorHandler.tsx";
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
      "/tags/",
      { name },
      { headers: { Authorization: "" } } // interceptorsで付与される
    );
    return response.data;
  } catch (error: any) {
    handleApiError(error, setError, "タグ作成に失敗しました。");
    return null;
  }
};

// タグ一覧取得（認証不要）
export const fetchTags = async (
  setError: Dispatch<SetStateAction<string>>
): Promise<Tag[]> => {
  try {
    const response = await client.get<Tag[]>("/tags/", {
      headers: { Authorization: "none" }, // 認証不要を明示
    });
    return response.data;
  } catch (error: any) {
    handleApiError(error, setError, "タグ作成に失敗しました。");
    return [];
  }
};
