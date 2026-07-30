import axios from "axios";
import {
  getToken,
  clearSession,
} from "@/lib/auth";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://192.168.1.81:8000";

console.log("API configurada en:", baseURL);

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Rutas públicas que no necesitan JWT
const publicRoutes = [
  "/auth/login",
  "/auth/register",
];

api.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || "";

    const isPublicRoute =
      publicRoutes.some((route) =>
        requestUrl.includes(route)
      );

    if (!isPublicRoute) {
      const token = getToken();

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const requestUrl =
      error.config?.url || "";

    const isAuthenticationRequest =
      publicRoutes.some((route) =>
        requestUrl.includes(route)
      );

    /*
     * No redirigir automáticamente cuando el 401
     * provenga del login, porque en ese caso solo
     * significa que las credenciales son incorrectas.
     */
    if (
      error.response?.status === 401 &&
      !isAuthenticationRequest &&
      typeof window !== "undefined"
    ) {
      clearSession();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;