// src/API/File.tsx
import axios from "axios";
import { Dispatch, SetStateAction } from "react";

const BASE_URL: string = "http://localhost:8000";

export type UploadedFile = {
  id: number;
  file: string; // サーバーから返されるURL
  uploaded_at: string;
};

export const uploadFile = async (
  file: File,
  setError: Dispatch<SetStateAction<string>>
): Promise<UploadedFile | null> => {
  try {
    const formData: FormData = new FormData();
    formData.append("file", file);

    const token: string | null = localStorage.getItem("authToken");

    const response = await axios.post<UploadedFile>(
      `${BASE_URL}/api/files/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          setError("ファイルが不正です。再度選択してください。");
          break;
        case 401:
          setError("認証エラー。管理者アカウントでログインしてください。");
          break;
        case 500:
          setError("サーバーエラーが発生しました。");
          break;
        default:
          setError("ファイルアップロードに失敗しました。");
          break;
      }
    } else {
      setError("ネットワークエラーが発生しました。");
    }
    return null;
  }
};

export const fetchFiles = async (): Promise<UploadedFile[]> => {
  const response = await axios.get<UploadedFile[]>(`${BASE_URL}/api/files/`);
  return response.data;
};
