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

export const uploadFile = async (
  file: File,
  setError: Dispatch<SetStateAction<string>>
): Promise<UploadedFile | null> => {
  try {
    const formData: FormData = new FormData();
    formData.append("file", file);

    const token: string | null = localStorage.getItem("authToken");

    const response = await client.post<UploadedFile>("/api/files/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error: any) {
    handleApiError(error, setError, "ファイルアップロードに失敗しました。");
    return null;
  }
};

export const fetchFiles = async (): Promise<UploadedFile[]> => {
  const response = await client.get<UploadedFile[]>("/api/files/");
  return response.data;
};
