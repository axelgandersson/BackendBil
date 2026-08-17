import axios from "axios";
import * as p from "@clack/prompts";
import { getToken, clearToken } from "./auth.js";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await clearToken();
      p.log.error("Sessionen har gått ut. Logga in igen.");
    }
    return Promise.reject(error);
  }
);

export default api;
