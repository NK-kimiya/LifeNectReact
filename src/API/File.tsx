// src/API/File.tsx
import axios from "axios";
import client from "./client.tsx";
import { Dispatch, SetStateAction } from "react";
import { handleApiError } from "./errorHandler.tsx";
const BASE_URL: string = "http://localhost:8000";

export type UploadedFile = {
  id: number;
  file: string; // サーバーから返されるURL
  uploaded_at: string;
  file_url?: string;
};

let _filesCache: { data: UploadedFile[] | null; ts: number } = {
  data: null,
  ts: 0,
};
const FILES_TTL_MS: number = 5 * 60 * 1000;

const invalidateFilesCache = (): void => {
  _filesCache = { data: null, ts: 0 };
};

export const uploadFile = async (
  file: File,
  setError: Dispatch<SetStateAction<string>>
): Promise<UploadedFile | null> => {
  try {
    const formData: FormData = new FormData();
    formData.append("file", file);

    const token: string | null = localStorage.getItem("authToken");

    const response = await client.post<UploadedFile>("/files/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    invalidateFilesCache();
    return response.data;
  } catch (error: any) {
    handleApiError(error, setError, "ファイルアップロードに失敗しました。");
    return null;
  }
};

export const fetchFiles = async (
  setError: Dispatch<SetStateAction<string>>,
  forceRefresh: boolean = false
): Promise<UploadedFile[] | null> => {
  const now: number = Date.now();
  const isValid: boolean =
    !!_filesCache.data && now - _filesCache.ts < FILES_TTL_MS;

  if (!forceRefresh && isValid) {
    // ★追加
    return _filesCache.data as UploadedFile[]; // ★追加（nullでないと分かる箇所）
  }

  try {
    const response = await client.get<UploadedFile[]>("/files/");
    _filesCache = { data: response.data, ts: now };
    return response.data;
  } catch (error) {
    handleApiError(error, setError, "ファイルの取得に失敗しました。");
    return null;
  }
};
