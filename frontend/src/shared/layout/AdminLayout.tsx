import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../ui/cn';

const enlaces = [
  { to: '/admin/resumen', label: 'Resumen' },
  { to: '/admin/categorias', label: 'Categorías' },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/usuarios', label: 'Usuarios' },
];

export function AdminLayout() {
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {enlaces.map((enlace) => (
          <NavLink
            key={enlace.to}
            to={enlace.to}
            className={({ isActive }) =>
              cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                isActive ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700',
              )
            }
          >
            {enlace.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
