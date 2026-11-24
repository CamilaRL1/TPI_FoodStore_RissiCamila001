import { useState } from 'react';
import type { FormEvent } from 'react';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Paginacion } from '../../../shared/components/Paginacion';
import { Skeleton } from '../../../shared/components/Skeleton';
import { getErrorMessage } from '../../../shared/api/handleApiError';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { useCategorias } from '../../categorias';
import { ProductoCard } from '../components/ProductoCard';
import { useProductos } from '../hooks/useProductos';

const LIMIT = 8;

export function CatalogoPage() {
  const [busqueda, setBusqueda] = useState(''); // lo que se escribe
  const [search, setSearch] = useState(''); // lo que se aplicó
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [skip, setSkip] = useState(0); // skip = (página - 1) × limit

  const categorias = useCategorias();
  const productos = useProductos({
    skip,
    limit: LIMIT,
    search: search || undefined,
    categoria_id: categoriaId,
  });

  const buscar = (e: FormEvent) => {
    e.preventDefault();
    setSearch(busqueda.trim());
    setSkip(0);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setSearch('');
    setCategoriaId(undefined);
    setSkip(0);
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 px-6 py-8 text-white shadow-lg shadow-orange-900/10 sm:px-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-24 hidden h-40 w-40 rounded-full bg-black/10 sm:block" />
        <div className="relative max-w-md">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Catálogo</h1>
          <p className="mt-2 text-orange-50">Elegí tus favoritos: pizzas, hamburguesas y bebidas.</p>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-6 hidden gap-3 text-6xl sm:flex" aria-hidden="true">
          <span className="-rotate-12">🍕</span>
          <span className="translate-y-2">🍔</span>
          <span className="rotate-12">🥤</span>
        </div>
      </section>

      <form
        onSubmit={buscar}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm"
      >
        <div className="min-w-56 flex-1">
          <Input
            label="Buscar"
            name="busqueda"
            placeholder="Nombre del producto"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="min-w-48">
          <Select
            label="Categoría"
            name="categoria"
            value={categoriaId?.toString() ?? ''}
            onChange={(e) => {
              setCategoriaId(e.target.value === '' ? undefined : Number(e.target.value));
              setSkip(0);
            }}
          >
            <option value="">Todas</option>
            {categorias.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {productos.isPending && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: LIMIT }, (_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      )}

      {productos.isError && (
        <EstadoError
          mensaje={getErrorMessage(productos.error, 'No se pudo cargar el catálogo')}
          onReintentar={() => void productos.refetch()}
        />
      )}

      {productos.data && productos.data.items.length === 0 && (
        <EstadoVacio
          titulo="No encontramos productos"
          descripcion="Probá con otra búsqueda o categoría."
          accion={
            <Button variant="secondary" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          }
        />
      )}

      {productos.data && productos.data.items.length > 0 && (
        <>
          <div
            className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 ${
              productos.isFetching ? 'opacity-60' : ''
            }`}
          >
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion skip={skip} limit={LIMIT} total={productos.data.total} onChange={setSkip} />
        </>
      )}
    </div>
  );
}
