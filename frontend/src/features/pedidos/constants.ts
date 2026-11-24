import type { EstadoPedido, FormaPago } from './types';

export const FORMAS_PAGO: ReadonlyArray<{ value: FormaPago; label: string }> = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
];

export function esFormaPago(valor: string): valor is FormaPago {
  return FORMAS_PAGO.some((f) => f.value === valor);
}

export function etiquetaFormaPago(valor: FormaPago): string {
  return FORMAS_PAGO.find((f) => f.value === valor)?.label ?? valor;
}

export const ESTADOS: ReadonlyArray<{ value: EstadoPedido; label: string }> = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_PREPARACION', label: 'En preparación' },
  { value: 'ENTREGADO', label: 'Entregado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export function esEstadoPedido(valor: string): valor is EstadoPedido {
  return ESTADOS.some((e) => e.value === valor);
}

/** Espejo de la máquina de estados del backend (RN-02). El backend es quien valida. */
export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

export const ETIQUETA_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Volver a pendiente',
  EN_PREPARACION: 'Pasar a preparación',
  ENTREGADO: 'Marcar entregado',
  CANCELADO: 'Cancelar',
};
