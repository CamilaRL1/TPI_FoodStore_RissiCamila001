import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/api/queryKeys';
import { actualizarCategoria, crearCategoria, eliminarCategoria, listarCategorias } from '../api/categorias';
import type { CategoriaUpdate } from '../types';

export function useCategorias() {
  return useQuery({
    queryKey: queryKeys.categorias.all,
    queryFn: listarCategorias,
    staleTime: 5 * 60_000,
  });
}

export function useCrearCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categorias.all }),
  });
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) => actualizarCategoria(id, data),
    // El producto trae su categoría anidada: también se refresca el catálogo.
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.categorias.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.productos.all }),
      ]);
    },
  });
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categorias.all }),
  });
}
