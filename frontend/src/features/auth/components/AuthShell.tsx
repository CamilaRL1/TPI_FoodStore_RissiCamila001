import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ProductoImagen } from '../../../shared/components/ProductoImagen';

interface AuthShellProps {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
}

const PLATOS = [
  { nombre: 'Pizza', clase: 'rotate-[-4deg]' },
  { nombre: 'Hamburguesa', clase: 'rotate-3 translate-y-4' },
  { nombre: 'Gaseosa', clase: 'rotate-2' },
  { nombre: 'Cerveza', clase: 'rotate-[-3deg] translate-y-4' },
];

/** Marco visual de Login y Registro: panel con comida a la izquierda y el formulario a la derecha. */
export function AuthShell({ titulo, subtitulo, children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-orange-50 lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-black/10" />

        <Link to="/" className="relative text-2xl font-extrabold tracking-tight">
          🍴 Food Store
        </Link>

        <div className="relative space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {PLATOS.map((p) => (
              <div
                key={p.nombre}
                className={`group overflow-hidden rounded-2xl shadow-xl ring-4 ring-white/30 ${p.clase}`}
              >
                <ProductoImagen nombre={p.nombre} className="h-36 w-full" />
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-3xl font-bold leading-tight">Tu comida favorita, a un clic de distancia.</h2>
            <p className="mt-2 text-orange-100">Pizzas, hamburguesas y bebidas listas para pedir.</p>
          </div>
        </div>

        <p className="relative text-sm text-orange-100">© Food Store</p>
      </aside>

      <main className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-6 block text-center text-2xl font-extrabold text-orange-600 lg:hidden">
            🍴 Food Store
          </Link>
          <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-900/5 sm:p-8">
            <h1 className="text-center text-2xl font-bold text-gray-900">{titulo}</h1>
            <p className="mb-6 mt-1 text-center text-sm text-gray-500">{subtitulo}</p>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
