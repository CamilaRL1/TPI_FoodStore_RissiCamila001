import { formatearPrecio } from '../../../shared/utils/forms';
import { etiquetaFormaPago } from '../constants';
import type { Pedido } from '../types';

export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-3 text-sm">
      <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        <div>
          <dt className="inline font-medium">Dirección: </dt>
          <dd className="inline text-gray-600">{pedido.direccion_entrega}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Pago: </dt>
          <dd className="inline text-gray-600">{etiquetaFormaPago(pedido.forma_pago)}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="inline font-medium">Notas: </dt>
            <dd className="inline text-gray-600">{pedido.notas}</dd>
          </div>
        )}
      </dl>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="py-1 pr-2">Producto</th>
              <th className="py-1 pr-2 text-right">Cant.</th>
              <th className="py-1 pr-2 text-right">Precio</th>
              <th className="py-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((item) => (
              <tr key={item.producto_id} className="border-b last:border-0">
                <td className="py-1 pr-2">{item.nombre_producto}</td>
                <td className="py-1 pr-2 text-right">{item.cantidad}</td>
                <td className="py-1 pr-2 text-right">{formatearPrecio(item.precio_unitario)}</td>
                <td className="py-1 text-right">{formatearPrecio(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="pt-2 text-right font-semibold">
                Total
              </td>
              <td className="pt-2 text-right font-semibold">{formatearPrecio(pedido.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
