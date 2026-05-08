import axios from "axios";

export const TOKEN_KEY = "coursesphere_token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function extractApiError(err: unknown, fallback = "Erro inesperado"): string {
  if (axios.isAxiosError(err)) {
    const errs = err.response?.data?.errors;
    if (Array.isArray(errs) && errs.length) return errs.join(", ");
    return err.message || fallback;
  }
  return fallback;
}
