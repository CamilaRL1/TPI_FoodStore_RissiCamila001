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
import { Modal } from '../../../shared/ui/Modal';
import { FormularioCategoria } from '../components/FormularioCategoria';
import type { CategoriaFormValues } from '../components/FormularioCategoria';
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias';
import type { Categoria } from '../types';

type Dialogo =
  | { tipo: 'crear' }
  | { tipo: 'editar'; categoria: Categoria }
  | { tipo: 'eliminar'; categoria: Categoria }
  | null;

const SIN_CATEGORIAS: Categoria[] = []; // referencia estable para TanStack Table
const columnHelper = createColumnHelper<Categoria>();

export function AdminCategoriasPage() {
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [error, setError] = useState<string | null>(null);

  const categorias = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();

  const cerrar = () => {
    setDialogo(null);
    setError(null);
  };

  const guardar = async (values: CategoriaFormValues) => {
    const actual = dialogo;
    setError(null);
    const payload = {
      nombre: values.nombre.trim(),
      descripcion: values.descripcion.trim() === '' ? null : values.descripcion.trim(),
    };
    try {
      if (actual?.tipo === 'editar') {
        await actualizar.mutateAsync({ id: actual.categoria.id, data: payload });
      } else {
        await crear.mutateAsync(payload);
      }
      cerrar();
    } catch (e) {
      setError(getErrorMessage(e, 'No se pudo guardar la categoría')); // 409: nombre duplicado
    }
  };

  const confirmarEliminar = async () => {
    if (dialogo?.tipo !== 'eliminar') return;
    setError(null);
    try {
      await eliminar.mutateAsync(dialogo.categoria.id);
      cerrar();
    } catch (e) {
      setError(getErrorMessage(e, 'No se pudo eliminar la categoría'));
    }
  };

  const columns = [
    columnHelper.accessor('id', { header: 'ID' }),
    columnHelper.accessor('nombre', {
      header: 'Nombre',
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('descripcion', {
      header: 'Descripción',
      cell: (info) => info.getValue() ?? '—',
    }),
    columnHelper.display({
      id: 'acciones',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDialogo({ tipo: 'editar', categoria: row.original })}>
            Editar
          </Button>
          <Button variant="danger" onClick={() => setDialogo({ tipo: 'eliminar', categoria: row.original })}>
            Eliminar
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: categorias.data ?? SIN_CATEGORIAS,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => setDialogo({ tipo: 'crear' })}>Nueva categoría</Button>
      </div>

      {categorias.isPending && <Skeleton className="h-48" />}
      {categorias.isError && (
        <EstadoError
          mensaje={getErrorMessage(categorias.error, 'No se pudieron cargar las categorías')}
          onReintentar={() => void categorias.refetch()}
        />
      )}
      {categorias.data && (
        <DataTable table={table} paginacionCliente vacio="Todavía no hay categorías" />
      )}

      <Modal
        open={dialogo?.tipo === 'crear' || dialogo?.tipo === 'editar'}
        title={dialogo?.tipo === 'editar' ? 'Editar categoría' : 'Nueva categoría'}
        onClose={cerrar}
      >
        <FormularioCategoria
          inicial={
            dialogo?.tipo === 'editar'
              ? { nombre: dialogo.categoria.nombre, descripcion: dialogo.categoria.descripcion ?? '' }
              : undefined
          }
          onSubmit={guardar}
          onCancelar={cerrar}
          error={error}
        />
      </Modal>

      <Modal open={dialogo?.tipo === 'eliminar'} title="Eliminar categoría" onClose={cerrar}>
        <p className="mb-2 text-sm text-gray-600">
          ¿Eliminar la categoría <strong>{dialogo?.tipo === 'eliminar' ? dialogo.categoria.nombre : ''}</strong>?
        </p>
        <p className="mb-4 text-xs text-gray-500">
          Es una baja lógica: deja de listarse, pero su nombre no se libera y sus productos no se dan de baja
          automáticamente.
        </p>
        {error && (
          <p role="alert" className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={cerrar}>
            Volver
          </Button>
          <Button variant="danger" loading={eliminar.isPending} onClick={() => void confirmarEliminar()}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
