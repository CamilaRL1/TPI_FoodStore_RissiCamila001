import type { ReactNode } from 'react';

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-orange-200 bg-white p-10 text-center">
      <span className="text-4xl" aria-hidden="true">🍽️</span>
      <p className="text-lg font-semibold text-gray-700">{titulo}</p>
      {descripcion && <p className="text-sm text-gray-500">{descripcion}</p>}
      {accion}
    </div>
  );
}
