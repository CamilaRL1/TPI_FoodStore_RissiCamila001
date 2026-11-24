import { useCartStore } from '../../../store/cartStore';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { ProductoImagen } from '../../../shared/components/ProductoImagen';
import { formatearPrecio } from '../../../shared/utils/forms';
import type { Producto } from '../types';

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  );

  const sinStock = producto.stock <= 0;
  const noDisponible = !producto.disponible || sinStock;
  const tope = enCarrito >= producto.stock;

  return (
    <Card className="group flex animate-aparecer flex-col gap-3 overflow-hidden p-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-900/10">
      <div className="relative overflow-hidden rounded-t-xl">
        <ProductoImagen
          nombre={producto.nombre}
          categoria={producto.categoria.nombre}
          imagenUrl={producto.imagen_url}
          className="h-44 w-full"
        />
        {noDisponible && <div className="absolute inset-0 bg-white/50" />}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-4">
        <span className="w-fit rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-orange-600">
          {producto.categoria.nombre}
        </span>
        <h3 className="text-lg font-semibold leading-tight">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="line-clamp-2 text-sm text-gray-500">{producto.descripcion}</p>
        )}
      </div>

      <div className="flex items-center justify-between px-4">
        <span className="text-xl font-extrabold text-gray-900">{formatearPrecio(producto.precio_base)}</span>
        {noDisponible ? (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {sinStock ? 'Sin stock' : 'No disponible'}
          </span>
        ) : (
          <span className="text-xs text-gray-500">Stock: {producto.stock}</span>
        )}
      </div>

      <div className="px-4 pb-4">
        <Button
          className="w-full"
          disabled={noDisponible || tope}
          onClick={() =>
            agregar({
              producto_id: producto.id,
              nombre: producto.nombre,
              precio_unitario: producto.precio_base,
            })
          }
        >
          {tope && !noDisponible ? 'Máximo en el carrito' : 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  );
}
