import { Link } from 'react-router-dom';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Button } from '../../../shared/ui/Button';
import { ProductoImagen } from '../../../shared/components/ProductoImagen';
import { Card } from '../../../shared/ui/Card';
import { formatearPrecio } from '../../../shared/utils/forms';
import { useCartStore } from '../../../store/cartStore';

export function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        descripcion="Agregá productos desde el catálogo."
        accion={
          <Link to="/" className="text-sm font-medium text-orange-600 hover:underline">
            Ir al catálogo
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Carrito</h1>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="py-2 pr-2">Producto</th>
              <th className="py-2 pr-2 text-right">Precio</th>
              <th className="py-2 pr-2 text-center">Cantidad</th>
              <th className="py-2 pr-2 text-right">Subtotal</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.producto_id} className="border-b last:border-0">
                <td className="py-2 pr-2 font-medium">
                  <div className="flex items-center gap-3">
                    <ProductoImagen nombre={item.nombre} className="h-12 w-12 shrink-0 rounded-lg p-1!" />
                    {item.nombre}
                  </div>
                </td>
                <td className="py-2 pr-2 text-right">{formatearPrecio(item.precio_unitario)}</td>
                <td className="py-2 pr-2">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      className="px-2 py-1"
                      aria-label={`Quitar una unidad de ${item.nombre}`}
                      disabled={item.cantidad <= 1}
                      onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                    >
                      −
                    </Button>
                    <span className="w-6 text-center">{item.cantidad}</span>
                    <Button
                      variant="secondary"
                      className="px-2 py-1"
                      aria-label={`Agregar una unidad de ${item.nombre}`}
                      onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                    >
                      +
                    </Button>
                  </div>
                </td>
                <td className="py-2 pr-2 text-right">
                  {formatearPrecio(item.precio_unitario * item.cantidad)}
                </td>
                <td className="py-2 text-right">
                  <Button variant="ghost" onClick={() => quitar(item.producto_id)}>
                    Quitar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" onClick={vaciar}>
          Vaciar carrito
        </Button>
        <div className="flex items-center gap-4">
          <p className="text-xl font-extrabold">Total: {formatearPrecio(total)}</p>
          {/* Sin sesión, ProtectedRoute redirige a /login y vuelve a /checkout */}
          <Link
            to="/checkout"
            className="rounded-lg bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-600/30 hover:from-orange-600 hover:to-orange-700"
          >
            Continuar al checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
