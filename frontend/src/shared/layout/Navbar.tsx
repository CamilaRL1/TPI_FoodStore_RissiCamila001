import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';
import { cn } from '../ui/cn';

const enlaceClase = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-3 py-1.5 font-medium transition-colors',
    isActive ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600',
  );

export function Navbar() {
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidad = useCartStore((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-orange-600">
          <span aria-hidden="true">🍴</span> Food Store
        </Link>

        <div className="flex flex-1 flex-wrap items-center gap-1 text-sm">
          <NavLink to="/" end className={enlaceClase}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={enlaceClase}>
            Carrito
            {cantidad > 0 && (
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-orange-600 px-1.5 text-xs font-bold text-white">
                {cantidad}
              </span>
            )}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={enlaceClase}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === 'admin' && (
            <NavLink to="/admin/resumen" className={enlaceClase}>
              Panel
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm">
          {usuario ? (
            <>
              <span className="flex items-center gap-2 text-gray-700">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold uppercase text-orange-700"
                >
                  {usuario.full_name.charAt(0)}
                </span>
                <span>
                  {usuario.full_name} <span className="text-gray-400">({usuario.role})</span>
                </span>
              </span>
              <Button variant="secondary" onClick={() => void handleLogout()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-1.5 font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600">
                Ingresar
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-1.5 font-semibold text-white shadow-sm shadow-orange-600/30 hover:from-orange-600 hover:to-orange-700"
              >
                Registrarme
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
