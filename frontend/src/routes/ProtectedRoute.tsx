import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Rol } from '../features/usuarios';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  roles?: Rol[];
}

/** Sin sesión → /login; sin el rol → /unauthorized. La protección real está en el backend. */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  if (cargando) {
    return <div className="p-10 text-center text-gray-500">Verificando sesión…</div>;
  }
  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
