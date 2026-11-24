import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/api/queryKeys';
import { activarUsuario, desactivarUsuario, listarUsuarios } from '../api/usuarios';

export function useUsuarios() {
  return useQuery({ queryKey: queryKeys.usuarios.all, queryFn: listarUsuarios });
}

export function useActivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activarUsuario,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.all }),
  });
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.all }),
  });
}
