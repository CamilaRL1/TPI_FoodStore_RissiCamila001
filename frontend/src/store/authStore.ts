import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMe, postLogin, postLogout } from '../features/auth/api/auth';
import type { UserPublic } from '../features/usuarios';
import { setUnauthorizedHandler } from '../shared/api/axiosInstance';

export type SesionUsuario = Pick<UserPublic, 'id' | 'username' | 'full_name' | 'email' | 'role'>;

function aSesion(u: UserPublic): SesionUsuario {
  return { id: u.id, username: u.username, full_name: u.full_name, email: u.email, role: u.role };
}

interface AuthState {
  usuario: SesionUsuario | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await postLogin(username, password); // el JWT queda en la cookie HttpOnly
        const me = await getMe();
        set({ usuario: aSesion(me) });
      },

      logout: async () => {
        try {
          await postLogout();
        } finally {
          set({ usuario: null });
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const me = await getMe();
          set({ usuario: aSesion(me) });
        } catch {
          set({ usuario: null });
        } finally {
          set({ cargando: false });
        }
      },

      clearSession: () => set({ usuario: null }),
    }),
    {
      name: 'auth-storage',
      // Solo el usuario; nunca el token (vive en la cookie HttpOnly).
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);

// El interceptor de Axios limpia la sesión ante un 401 / cuenta desactivada.
setUnauthorizedHandler(() => useAuthStore.getState().clearSession());
