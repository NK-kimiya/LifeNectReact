import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { getToken } from "../Auth/token.tsx";

const apiUrl = process.env.REACT_APP_API_URL;

const client: AxiosInstance = axios.create({
  baseURL: `${apiUrl}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getToken();
    if (token && config.headers && config.headers.Authorization !== "none") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

client.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<never> => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export const clientPublic: AxiosInstance = axios.create({
  baseURL: `${apiUrl}/api`,
  headers: { "Content-Type": "application/json" },
});

export default client;
