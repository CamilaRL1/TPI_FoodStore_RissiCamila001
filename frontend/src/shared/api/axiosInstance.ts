import axios from 'axios';
import { extractDetail } from './handleApiError';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // el navegador adjunta la cookie HttpOnly; el token nunca se lee
});

// El authStore registra su handler al crearse (evita un import circular).
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

const DETAIL_CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada';

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      const url = error.config?.url ?? '';
      const esAuthInicial = url.includes('/auth/token') || url.includes('/auth/me');
      const cuentaDesactivada =
        status === 400 && extractDetail(data) === DETAIL_CUENTA_DESACTIVADA;

      // 401 fuera de login/me, o cuenta desactivada: se limpia la sesión.
      // La vuelta a /login la hace ProtectedRoute al quedar sin usuario.
      if ((status === 401 && !esAuthInicial) || cuentaDesactivada) {
        onUnauthorized?.();
      }
    }
    return Promise.reject(error);
  },
);
