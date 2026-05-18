import axios from "axios";
import { getToken, clearSession } from "@/lib/auth";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Adjunta el JWT en cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expira o es inválido, limpia sesión y redirige
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearSession();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
