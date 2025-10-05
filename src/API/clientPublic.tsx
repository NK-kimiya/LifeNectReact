// src/API/client.tsx
import axios, { AxiosInstance } from "axios";

// 認証付きクライアント
const client: AxiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token && token !== "null" && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 認証なしクライアント
export const clientPublic: AxiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

export default client;
