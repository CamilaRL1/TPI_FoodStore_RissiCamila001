import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Paginacion } from '../../../shared/components/Paginacion';
import { Skeleton } from '../../../shared/components/Skeleton';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';
import { PedidoCard } from '../components/PedidoCard';
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos';
import type { Pedido } from '../types';

const LIMIT = 10;

export function MisPedidosPage() {
  const [skip, setSkip] = useState(0);
  const [aCancelar, setACancelar] = useState<Pedido | null>(null);
  const [errorCancelar, setErrorCancelar] = useState<string | null>(null);

  const pedidos = usePedidos({ skip, limit: LIMIT });
  const cancelar = useCancelarPedido();

  const cerrarModal = () => {
    setACancelar(null);
    setErrorCancelar(null);
  };

  const confirmarCancelacion = async () => {
    if (!aCancelar) return;
    setErrorCancelar(null);
    try {
      await cancelar.mutateAsync(aCancelar.id);
      cerrarModal();
    } catch (e) {
      setErrorCancelar(getErrorMessage(e, 'No se pudo cancelar el pedido'));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Mis pedidos</h1>

      {pedidos.isPending && (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      )}

      {pedidos.isError && (
        <EstadoError
          mensaje={getErrorMessage(pedidos.error, 'No se pudieron cargar tus pedidos')}
          onReintentar={() => void pedidos.refetch()}
        />
      )}

      {pedidos.data && pedidos.data.items.length === 0 && (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          accion={
            <Link to="/" className="text-sm font-medium text-orange-600 hover:underline">
              Ver el catálogo
            </Link>
          }
        />
      )}

      {pedidos.data && pedidos.data.items.length > 0 && (
        <>
          <div className="space-y-3">
            {pedidos.data.items.map((p) => (
              <PedidoCard key={p.id} pedido={p} onCancelar={setACancelar} />
            ))}
          </div>
          <Paginacion skip={skip} limit={LIMIT} total={pedidos.data.total} onChange={setSkip} />
        </>
      )}

      <Modal open={aCancelar !== null} title="Cancelar pedido" onClose={cerrarModal}>
        <p className="mb-4 text-sm text-gray-600">
          ¿Querés cancelar el pedido #{aCancelar?.id}? Esta acción no se puede deshacer.
        </p>
        {errorCancelar && (
          <p role="alert" className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-700">
            {errorCancelar}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={cerrarModal}>
            Volver
          </Button>
          <Button variant="danger" loading={cancelar.isPending} onClick={() => void confirmarCancelacion()}>
            Sí, cancelar pedido
          </Button>
        </div>
      </Modal>
    </div>
  );
}
