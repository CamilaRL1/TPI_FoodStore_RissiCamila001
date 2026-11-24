import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/api/queryKeys';
import { cambiarEstadoPedido, cancelarPedido, crearPedido, listarPedidos, obtenerResumen } from '../api/pedidos';
import type { EstadoPedido, FiltrosPedidos } from '../types';

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: queryKeys.pedidos.lista(filtros),
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useResumenPedidos() {
  // La clave empieza con 'pedidos': invalidar ['pedidos'] también refresca el resumen.
  return useQuery({ queryKey: queryKeys.pedidos.resumen, queryFn: obtenerResumen });
}

/** Crear/cancelar/cambiar estado afectan pedidos Y stock de productos: se invalidan ambos. */
function useInvalidarPedidosYProductos() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.pedidos.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.all }),
    ]);
  };
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidosYProductos();
  return useMutation({ mutationFn: crearPedido, onSuccess: invalidar });
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidosYProductos();
  return useMutation({ mutationFn: cancelarPedido, onSuccess: invalidar });
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidosYProductos();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  });
}
