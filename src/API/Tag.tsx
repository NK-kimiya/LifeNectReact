// src/API/Tag.tsx
import { Dispatch, SetStateAction } from "react";
import client from "./client.tsx";
import { handleApiError } from "./errorHandler.tsx";
export type Tag = {
  id: number;
  name: string;
};

let _tagsCache: { data: Tag[] | null; ts: number } = { data: null, ts: 0 }; //取得済みのタグ配列と、その取得時刻を保持するキャッシュ変数
const TAGS_TTL_MS: number = 5 * 60 * 1000; // キャッシュの有効期間

const invalidateTagsCache = (): void => {
  //キャッシュ無効化ヘルパ
  _tagsCache = { data: null, ts: 0 };
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
    invalidateTagsCache();
    return response.data;
  } catch (error: any) {
    handleApiError(error, setError, "タグ作成に失敗しました。");
    return null;
  }
};

// タグ一覧取得（認証不要）
export const fetchTags = async (
  setError: Dispatch<SetStateAction<string>>,
  forceRefresh: boolean = false // ★追加
): Promise<Tag[]> => {
  const now: number = Date.now();
  const isCacheValid: boolean =
    _tagsCache.data !== null && now - _tagsCache.ts < TAGS_TTL_MS; //now - _tagsCache.ts < TAGS_TTL_MS … 保存時刻からTTL以内

  if (!forceRefresh && isCacheValid) {
    //強制再取得が要求されておらず（!forceRefresh）、かつ キャッシュが有効 なら即返却
    return _tagsCache.data as Tag[]; // ★追加（dataはnullでないことが確定）
  }
  try {
    const response = await client.get<Tag[]>("/tags/", {
      headers: { Authorization: "none" }, // 認証不要を明示
    });

    _tagsCache = { data: response.data, ts: now };
    return response.data;
  } catch (error: any) {
    handleApiError(error, setError, "タグ作成の取得に失敗しました。");
    return [];
  }
};
