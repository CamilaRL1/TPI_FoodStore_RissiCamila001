import { useState } from 'react';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { formatearFecha, formatearPrecio } from '../../../shared/utils/forms';
import type { Pedido } from '../types';
import { PedidoDetalle } from './PedidoDetalle';

interface PedidoCardProps {
  pedido: Pedido;
  onCancelar: (pedido: Pedido) => void;
}

export function PedidoCard({ pedido, onCancelar }: PedidoCardProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">Pedido #{pedido.id}</p>
          <p className="text-xs text-gray-500">{formatearFecha(pedido.created_at)}</p>
        </div>
        <BadgeEstado estado={pedido.estado} />
        <p className="text-lg font-bold">{formatearPrecio(pedido.total)}</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setAbierto((v) => !v)}>
            {abierto ? 'Ocultar detalle' : 'Ver detalle'}
          </Button>
          {pedido.estado === 'PENDIENTE' && (
            <Button variant="danger" onClick={() => onCancelar(pedido)}>
              Cancelar
            </Button>
          )}
        </div>
      </div>
      {abierto && <PedidoDetalle pedido={pedido} />}
    </Card>
  );
}
