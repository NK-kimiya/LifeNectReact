// src/API/RagChat.tsx
import axios, { AxiosResponse } from "axios";
import client from "./client.tsx"; // 既存のaxios設定済みインスタンスを利用

// レスポンス型を定義
export interface RagResponse {
  answer: string;
}

export const fetchRagAnswer = async (
  text: string
): Promise<AxiosResponse<RagResponse>> => {
  return client.post<RagResponse>("api/rag-answer/", { text });
};
