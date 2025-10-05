// src/API/Blog.tsx
import client from "./client.tsx";
import { Dispatch, SetStateAction } from "react";
import { handleApiError } from "./errorHandler.tsx";
import { clientPublic } from "./client.tsx";
export type BlogArticle = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags: number[]; // タグIDの配列
};

export const createBlog = async (
  title: string,
  body: string,
  tags: number[],
  eyecatch: string,
  setError: Dispatch<SetStateAction<string>>
): Promise<BlogArticle | null> => {
  try {
    const response = await client.post<BlogArticle>("/api/articles/", {
      title,
      body,
      tags,
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
