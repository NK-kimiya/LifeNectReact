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
    const response = await client.post<BlogArticle>("/api/articles/", {
      title,
      body,
      tag_ids: tagIds,
      eyecatch,
    });
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

export const fetchArticles = async (): Promise<BlogArticle[]> => {
  try {
    const response = await clientPublic.get<BlogArticle[]>("/api/articles/");
    return response.data;
  } catch (error) {
    return [];
  }
};

export const fetchArticleById = async (id: string): Promise<BlogArticle> => {
  const res = await axios.get(`http://localhost:8000/api/articles/${id}/`);
  return res.data;
};

export const updateBlog = async (
  id: number,
  title: string,
  body: string,
  tagIds: number[],
  eyecatch: string,
  setError: (msg: string) => void
): Promise<BlogArticle | null> => {
  try {
    const response = await client.put(`api/articles/${id}/`, {
      title,
      body,
      tag_ids: tagIds,
      eyecatch,
    });
    return response.data;
  } catch (error: any) {
    setError("記事の更新に失敗しました。");
    return null;
  }
};

export const deleteBlog = async (
  id: number,
  setError: (msg: string) => void
): Promise<boolean> => {
  try {
    await client.delete(`api/articles/${id}/`);
    return true; // 成功したら true
  } catch (error: any) {
    setError("記事の削除に失敗しました。");
    return false;
  }
};

export const fetchFilteredArticles = async (
  keyword: string,
  tag: string
): Promise<AxiosResponse<BlogArticle[]>> => {
  try {
    const response = await client.get<BlogArticle[]>("api/articles-search/", {
      params: {
        search: keyword || undefined,
        tag: tag || undefined,
      },
    });
    console.log("タグ" + tag + "を検索");
    return response;
  } catch (error) {
    throw error;
  }
};
