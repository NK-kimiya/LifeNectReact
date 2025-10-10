// src/API/RagChat.tsx
import axios, { AxiosResponse } from "axios"; // 既存のaxios設定済みインスタンスを利用
import { clientPublic } from "./client.tsx";

export interface IdTitle {
  id: number;
  title: string;
}

// レスポンス型を定義
export interface RagResponse {
  answer: string;
  id_title_list: IdTitle[];
}

export const fetchRagAnswer = async (
  text: string,
  allowSave: boolean
): Promise<AxiosResponse<RagResponse>> => {
  return clientPublic.post<RagResponse>("/rag-answer/", { text, allowSave });
};
