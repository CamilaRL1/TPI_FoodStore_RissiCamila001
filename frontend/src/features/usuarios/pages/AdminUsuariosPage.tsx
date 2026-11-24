import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { getErrorMessage } from '../../../shared/api/handleApiError';
import { DataTable } from '../../../shared/components/DataTable';
import { EstadoError } from '../../../shared/components/EstadoError';
import { Skeleton } from '../../../shared/components/Skeleton';
import { Button } from '../../../shared/ui/Button';
import { cn } from '../../../shared/ui/cn';
import { useAuthStore } from '../../../store/authStore';
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios';
import type { UserPublic } from '../types';

const SIN_USUARIOS: UserPublic[] = []; // referencia estable para TanStack Table
const columnHelper = createColumnHelper<UserPublic>();

export function AdminUsuariosPage() {
  const sesion = useAuthStore((s) => s.usuario);
  const [error, setError] = useState<string | null>(null);

  const usuarios = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();
  const ocupado = activar.isPending || desactivar.isPending;

  const ejecutar = async (accion: () => Promise<unknown>) => {
    setError(null);
    try {
      await accion();
    } catch (e) {
      setError(getErrorMessage(e, 'No se pudo completar la operación'));
    }
  };

  const columns = [
    columnHelper.accessor('username', {
      header: 'Usuario',
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('full_name', { header: 'Nombre' }),
    columnHelper.accessor('email', { header: 'Email' }),
    columnHelper.accessor('role', {
      header: 'Rol',
      cell: (info) => (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            info.getValue() === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700',
          )}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('disabled', {
      header: 'Estado',
      cell: (info) => (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            info.getValue() ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800',
          )}
        >
          {info.getValue() ? 'Desactivado' : 'Activo'}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'acciones',
      header: '',
      cell: ({ row }) => {
        const usuario = row.original;
        const esYo = usuario.id === sesion?.id;
        return (
          <div className="flex justify-end gap-2">
            {usuario.disabled && (
              <Button
                variant="secondary"
                disabled={ocupado}
                onClick={() => void ejecutar(() => activar.mutateAsync(usuario.id))}
              >
                Activar
              </Button>
            )}
            {/* El admin no puede desactivarse a sí mismo: no se muestra en su fila. */}
            {!usuario.disabled && !esYo && (
              <Button
                variant="danger"
                disabled={ocupado}
                onClick={() => void ejecutar(() => desactivar.mutateAsync(usuario.id))}
              >
                Desactivar
              </Button>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: usuarios.data ?? SIN_USUARIOS,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Usuarios</h1>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {usuarios.isPending && <Skeleton className="h-48" />}
      {usuarios.isError && (
        <EstadoError
          mensaje={getErrorMessage(usuarios.error, 'No se pudieron cargar los usuarios')}
          onReintentar={() => void usuarios.refetch()}
        />
      )}
      {usuarios.data && <DataTable table={table} paginacionCliente vacio="No hay usuarios" />}
    </div>
  );
}
