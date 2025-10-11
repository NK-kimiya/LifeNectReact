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

export const fetchArticles = async (
  setError: Dispatch<SetStateAction<string>>
): Promise<BlogArticle[]> => {
  try {
    const response = await clientPublic.get<BlogArticle[]>("/articles/");
    return response.data;
  } catch (error) {
    handleApiError(error, setError, "ブログ記事の取得に失敗しました。");
    return [];
  }
};

export const fetchArticleById = async (
  id: string,
  setError: Dispatch<SetStateAction<string>>
): Promise<BlogArticle | null> => {
  try {
    const res = await clientPublic.get(`/articles/${id}/`);
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
    return true; // 成功したら true
  } catch (error: any) {
    handleApiError(error, setError, "記事の削除に失敗しました。");
    return false;
  }
};

export const fetchFilteredArticles = async (
  keyword: string,
  tag: string,
  setError: Dispatch<SetStateAction<string>>
): Promise<BlogArticle[]> => {
  try {
    const response = await client.get<BlogArticle[]>("/articles-search/", {
      params: {
        search: keyword || undefined,
        tag: tag || undefined,
      },
    });
    console.log("タグ" + tag + "を検索");
    return response.data;
  } catch (error) {
    handleApiError(error, setError, "記事の検索に失敗しました。");
    return [];
  }
};
