import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useState } from 'react';
import { getErrorMessage } from '../../../shared/api/handleApiError';
import { DataTable } from '../../../shared/components/DataTable';
import { EstadoError } from '../../../shared/components/EstadoError';
import { Paginacion } from '../../../shared/components/Paginacion';
import { Skeleton } from '../../../shared/components/Skeleton';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';
import { Select } from '../../../shared/ui/Select';
import { formatearFecha, formatearPrecio } from '../../../shared/utils/forms';
import { PedidoDetalle } from '../components/PedidoDetalle';
import { esEstadoPedido, ESTADOS, ETIQUETA_ACCION, TRANSICIONES } from '../constants';
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos';
import type { EstadoPedido, Pedido } from '../types';

const LIMIT = 10;
const SIN_PEDIDOS: Pedido[] = []; // referencia estable para TanStack Table
const columnHelper = createColumnHelper<Pedido>();

export function AdminPedidosPage() {
  const [skip, setSkip] = useState(0);
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const [detalle, setDetalle] = useState<Pedido | null>(null);
  const [aCancelar, setACancelar] = useState<Pedido | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pedidos = usePedidos({ skip, limit: LIMIT, estado });
  const cambiar = useCambiarEstadoPedido();

  const aplicar = async (pedido: Pedido, nuevo: EstadoPedido) => {
    setError(null);
    try {
      await cambiar.mutateAsync({ id: pedido.id, estado: nuevo });
      setACancelar(null);
    } catch (e) {
      // 400: transición inválida
      setError(getErrorMessage(e, 'No se pudo cambiar el estado del pedido'));
    }
  };

  const cerrarCancelacion = () => {
    setACancelar(null);
    setError(null);
  };

  const columns = [
    columnHelper.accessor('id', { header: '#', cell: (info) => `#${info.getValue()}` }),
    columnHelper.accessor('usuario_id', { header: 'Cliente', cell: (info) => `Usuario ${info.getValue()}` }),
    columnHelper.accessor('created_at', { header: 'Fecha', cell: (info) => formatearFecha(info.getValue()) }),
    columnHelper.accessor('total', { header: 'Total', cell: (info) => formatearPrecio(info.getValue()) }),
    columnHelper.accessor('estado', {
      header: 'Estado',
      cell: (info) => <BadgeEstado estado={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'acciones',
      header: '',
      cell: ({ row }) => {
        const pedido = row.original;
        return (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setDetalle(pedido)}>
              Detalle
            </Button>
            {TRANSICIONES[pedido.estado].map((destino) =>
              destino === 'CANCELADO' ? (
                <Button
                  key={destino}
                  variant="danger"
                  disabled={cambiar.isPending}
                  onClick={() => {
                    setError(null);
                    setACancelar(pedido);
                  }}
                >
                  Cancelar
                </Button>
              ) : (
                <Button key={destino} disabled={cambiar.isPending} onClick={() => void aplicar(pedido, destino)}>
                  {ETIQUETA_ACCION[destino]}
                </Button>
              ),
            )}
          </div>
        );
      },
    }),
  ];

  // La paginación es del servidor (skip/limit): la tabla solo muestra la página actual.
  const table = useReactTable({
    data: pedidos.data?.items ?? SIN_PEDIDOS,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="w-52">
          <Select
            label="Filtrar por estado"
            name="estado"
            value={estado ?? ''}
            onChange={(e) => {
              const valor = e.target.value;
              setEstado(esEstadoPedido(valor) ? valor : undefined);
              setSkip(0);
            }}
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error && !aCancelar && (
        <p role="alert" className="rounded-md bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {pedidos.isPending && <Skeleton className="h-64" />}
      {pedidos.isError && (
        <EstadoError
          mensaje={getErrorMessage(pedidos.error, 'No se pudieron cargar los pedidos')}
          onReintentar={() => void pedidos.refetch()}
        />
      )}
      {pedidos.data && (
        <>
          <DataTable table={table} vacio="No hay pedidos para mostrar" />
          <Paginacion skip={skip} limit={LIMIT} total={pedidos.data.total} onChange={setSkip} />
        </>
      )}

      <Modal open={detalle !== null} title={`Pedido #${detalle?.id ?? ''}`} onClose={() => setDetalle(null)}>
        {detalle && <PedidoDetalle pedido={detalle} />}
      </Modal>

      <Modal open={aCancelar !== null} title="Cancelar pedido" onClose={cerrarCancelacion}>
        <p className="mb-4 text-sm text-gray-600">
          ¿Cancelar el pedido #{aCancelar?.id}? El stock de sus productos se restituye y la acción no se puede
          deshacer.
        </p>
        {error && (
          <p role="alert" className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={cerrarCancelacion}>
            Volver
          </Button>
          <Button
            variant="danger"
            loading={cambiar.isPending}
            onClick={() => aCancelar && void aplicar(aCancelar, 'CANCELADO')}
          >
            Sí, cancelar pedido
          </Button>
        </div>
      </Modal>
    </div>
  );
}
