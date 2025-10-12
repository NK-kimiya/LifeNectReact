// src/API/Blog.tsx
import client from "./client.tsx";
import { Dispatch, SetStateAction } from "react";
import { handleApiError } from "./errorHandler.tsx";
import { clientPublic } from "./client.tsx";
import { AxiosResponse } from "axios";
import axios from "axios";
export type BlogArticle = {
  id: number;
  title: string;
  body: string;
  eyecatch: string;
  created_at: string;
  updated_at: string;
  tags: { id: number; name: string }[]; // タグIDの配列
};

export const createBlog = async (
  title: string,
  body: string,
  tagIds: number[],
  eyecatch: string,
  setError: Dispatch<SetStateAction<string>>
): Promise<BlogArticle | null> => {
  try {
    const response = await client.post<BlogArticle>("/articles/", {
      title,
      body,
      tag_ids: tagIds,
      eyecatch,
    });
    invalidateBlogCaches();
    return response.data;
  } catch (error: any) {
    handleApiError(error, setError, "ブログ記事の作成に失敗しました。");
    return null;
  }
};

export type Tag = {
  id: number;
  name: string;
};

export type BlogArticleList = {
  id: number;
  title: string;
  body: string;
  eyecatch?: string | null;
  created_at: string;
  updated_at: string;
  tags: Tag[];
};

const BLOG_TTL_MS: number = 5 * 60 * 1000; // ★追加: 5分（300,000ms）
let _listCache: { data: BlogArticle[] | null; ts: number } = {
  data: null,
  ts: 0,
}; // ★追加
const _detailCache = new Map<number, { data: BlogArticle; ts: number }>(); // ★追加
const _searchCache = new Map<string, { data: BlogArticle[]; ts: number }>(); // ★追加

export const invalidateBlogCaches = (): void => {
  //一括無効化
  _listCache = { data: null, ts: 0 };
  _detailCache.clear();
  _searchCache.clear();
};

export const fetchArticles = async (
  setError: Dispatch<SetStateAction<string>>,
  forceRefresh: boolean = false
): Promise<BlogArticle[]> => {
  const now = Date.now();
  const isValid = _listCache.data && now - _listCache.ts < BLOG_TTL_MS;

  if (!forceRefresh && isValid) {
    // ★追加
    return _listCache.data as BlogArticle[]; // ★追加（nullでないと判断できる箇所）
  }

  try {
    const response = await clientPublic.get<BlogArticle[]>("/articles/");
    _listCache = { data: response.data, ts: now };
    return response.data;
  } catch (error) {
    handleApiError(error, setError, "ブログ記事の取得に失敗しました。");
    return [];
  }
};

export const fetchArticleById = async (
  id: string,
  setError: Dispatch<SetStateAction<string>>,
  forceRefresh: boolean = false
): Promise<BlogArticle | null> => {
  const now = Date.now();
  const numericId = Number(id);
  const cached = _detailCache.get(numericId); //キー numericId に対応する キャッシュ項目（{ data, ts }）を取得
  const isValid = cached && now - cached.ts < BLOG_TTL_MS;
  if (!forceRefresh && isValid && cached) {
    // ★追加
    return cached.data; // ★追加
  }
  try {
    const res = await clientPublic.get(`/articles/${id}/`);
    _detailCache.set(numericId, { data: res.data, ts: now });
    return res.data;
  } catch (error) {
    handleApiError(error, setError, "ブログ記事の取得に失敗しました。");
    return null;
  }
};

export const updateBlog = async (
  id: number,
  title: string,
  body: string,
  tagIds: number[],
  eyecatch: string,
  setError: Dispatch<SetStateAction<string>>
): Promise<BlogArticle | null> => {
  try {
    const response = await client.put(`/articles/${id}/`, {
      title,
      body,
      tag_ids: tagIds,
      eyecatch,
    });
    invalidateBlogCaches();
    return response.data;
  } catch (error: any) {
    handleApiError(error, setError, "ブログ記事の更新に失敗しました。");
    return null;
  }
};

export const deleteBlog = async (
  id: number,
  setError: Dispatch<SetStateAction<string>>
): Promise<boolean> => {
  try {
    await client.delete(`/articles/${id}/`);
    invalidateBlogCaches();
    return true; // 成功したら true
  } catch (error: any) {
    handleApiError(error, setError, "記事の削除に失敗しました。");
    return false;
  }
};

export const fetchFilteredArticles = async (
  keyword: string,
  tag: string,
  setError: Dispatch<SetStateAction<string>>,
  forceRefresh: boolean = false
): Promise<BlogArticle[]> => {
  const now = Date.now();
  const key = `${keyword}||${tag}`;
  const hit = _searchCache.get(key);
  const isValid = hit && now - hit.ts < BLOG_TTL_MS;

  if (!forceRefresh && isValid && hit) {
    // ★追加
    return hit.data; // ★追加
  }
  try {
    const response = await client.get<BlogArticle[]>("/articles-search/", {
      params: {
        search: keyword || undefined,
        tag: tag || undefined,
      },
    });
    _searchCache.set(key, { data: response.data, ts: now });
    return response.data;
  } catch (error) {
    handleApiError(error, setError, "記事の検索に失敗しました。");
    return [];
  }
};
