// src/API/RagChat.tsx
import axios, { AxiosResponse } from "axios"; // 既存のaxios設定済みインスタンスを利用
import { clientPublic } from "./client.tsx";
import { Dispatch, SetStateAction } from "react";
import { handleApiError } from "./errorHandler.tsx";

export interface IdTitle {
  id: number;
  title: string;
}

// レスポンス型を定義
export interface RagResponse {
  answer: string;
  article: IdTitle[];

  mode: "normal" | "safety_only";
  primary_support: {
    title: string;
    name: string;
    url: string;
  } | null;
  other_supports: {
    name: string;
    url: string;
  }[];
}

export const fetchRagAnswer = async (
  text: string,
  allowSave: boolean,
): Promise<AxiosResponse<RagResponse>> => {
  return clientPublic.post<RagResponse>("/rag-answer/", { text, allowSave });
};
