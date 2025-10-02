// src/API/File.tsx
import axios from "axios";

const BASE_URL: string = "http://localhost:8000";

export type UploadedFile = {
  id: number;
  file: string; // サーバーから返されるURL
  uploaded_at: string;
};

export const uploadFile = async (file: File): Promise<UploadedFile> => {
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
};

export const fetchFiles = async (): Promise<UploadedFile[]> => {
  const response = await axios.get<UploadedFile[]>(`${BASE_URL}/api/files/`);
  return response.data;
};
