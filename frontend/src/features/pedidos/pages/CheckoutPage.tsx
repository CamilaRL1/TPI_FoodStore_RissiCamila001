import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/api/handleApiError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Card } from '../../../shared/ui/Card';
import { formatearPrecio } from '../../../shared/utils/forms';
import { useCartStore } from '../../../store/cartStore';
import { FormularioCheckout } from '../components/FormularioCheckout';
import type { CheckoutValues } from '../components/FormularioCheckout';
import { useCrearPedido } from '../hooks/usePedidos';

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const crearPedido = useCrearPedido();
  const [error, setError] = useState<string | null>(null);

  const confirmar = async (values: CheckoutValues) => {
    setError(null);
    try {
      await crearPedido.mutateAsync({
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: values.forma_pago,
        direccion_entrega: values.direccion_entrega.trim(),
        notas: values.notas.trim() === '' ? null : values.notas.trim(),
      });
      navigate('/mis-pedidos', { replace: true });
      vaciar();
    } catch (e) {
      // 400: stock insuficiente / producto no disponible; 404: producto inexistente
      setError(getErrorMessage(e, 'No se pudo crear el pedido'));
    }
  };

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay nada para confirmar"
        descripcion="Tu carrito está vacío."
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
      <h1 className="text-3xl font-extrabold tracking-tight">Confirmar pedido</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <FormularioCheckout onSubmit={confirmar} error={error} />
        </Card>

        <Card className="h-fit space-y-3">
          <h2 className="font-semibold">Resumen</h2>
          <ul className="divide-y text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between py-2">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="flex justify-between border-t pt-2 text-lg font-bold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </p>
        </Card>
      </div>
    </div>
  );
}
