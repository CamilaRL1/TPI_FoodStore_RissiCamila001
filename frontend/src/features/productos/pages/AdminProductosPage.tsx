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
import { cn } from '../../../shared/ui/cn';
import { formatearPrecio } from '../../../shared/utils/forms';
import { useCategorias } from '../../categorias';
import { FormularioProducto } from '../components/FormularioProducto';
import type { ProductoFormValues } from '../components/FormularioProducto';
import { FormularioStock } from '../components/FormularioStock';
import type { StockFormValues } from '../components/FormularioStock';
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos';
import type { Producto, ProductoCreate } from '../types';

type Dialogo =
  | { tipo: 'crear' }
  | { tipo: 'editar'; producto: Producto }
  | { tipo: 'stock'; producto: Producto }
  | { tipo: 'eliminar'; producto: Producto }
  | null;

const SIN_PRODUCTOS: Producto[] = []; // referencia estable para TanStack Table
const columnHelper = createColumnHelper<Producto>();

function aPayload(v: ProductoFormValues): ProductoCreate {
  return {
    categoria_id: Number(v.categoria_id),
    nombre: v.nombre.trim(),
    descripcion: v.descripcion.trim() === '' ? null : v.descripcion.trim(),
    precio_base: Number(v.precio_base),
    imagen_url: v.imagen_url.trim() === '' ? null : v.imagen_url.trim(),
    stock: Number(v.stock),
    disponible: v.disponible,
  };
}

export function AdminProductosPage() {
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [error, setError] = useState<string | null>(null);

  // El panel pide limit=100 y pagina del lado del cliente.
  const productos = useProductos({ skip: 0, limit: 100 });
  const categorias = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const cambiarStock = useActualizarStock();
  const eliminar = useEliminarProducto();

  const cerrar = () => {
    setDialogo(null);
    setError(null);
  };

  const guardar = async (values: ProductoFormValues) => {
    const actual = dialogo;
    setError(null);
    try {
      if (actual?.tipo === 'editar') {
        await actualizar.mutateAsync({ id: actual.producto.id, data: aPayload(values) });
      } else {
        await crear.mutateAsync(aPayload(values));
      }
      cerrar();
    } catch (e) {
      setError(getErrorMessage(e, 'No se pudo guardar el producto'));
    }
  };

  const guardarStock = async (values: StockFormValues) => {
    const actual = dialogo;
    if (actual?.tipo !== 'stock') return;
    setError(null);
    try {
      await cambiarStock.mutateAsync({
        id: actual.producto.id,
        data: { stock: Number(values.stock), disponible: values.disponible },
      });
      cerrar();
    } catch (e) {
      setError(getErrorMessage(e, 'No se pudo actualizar el stock'));
    }
  };

  const confirmarEliminar = async () => {
    if (dialogo?.tipo !== 'eliminar') return;
    setError(null);
    try {
      await eliminar.mutateAsync(dialogo.producto.id);
      cerrar();
    } catch (e) {
      setError(getErrorMessage(e, 'No se pudo eliminar el producto'));
    }
  };

  const columns = [
    columnHelper.accessor('id', { header: 'ID' }),
    columnHelper.accessor('nombre', {
      header: 'Nombre',
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor((row) => row.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
    columnHelper.accessor('precio_base', {
      header: 'Precio',
      cell: (info) => formatearPrecio(info.getValue()),
    }),
    columnHelper.accessor('stock', {
      header: 'Stock',
      cell: (info) => (
        <span className={cn(info.getValue() === 0 && 'font-semibold text-red-600')}>{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('disponible', {
      header: 'Disponible',
      cell: (info) => (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            info.getValue() ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700',
          )}
        >
          {info.getValue() ? 'Sí' : 'No'}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'acciones',
      header: '',
      cell: ({ row }) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => setDialogo({ tipo: 'editar', producto: row.original })}>
            Editar
          </Button>
          <Button variant="secondary" onClick={() => setDialogo({ tipo: 'stock', producto: row.original })}>
            Stock
          </Button>
          <Button variant="danger" onClick={() => setDialogo({ tipo: 'eliminar', producto: row.original })}>
            Eliminar
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: productos.data?.items ?? SIN_PRODUCTOS,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const listaCategorias = categorias.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => setDialogo({ tipo: 'crear' })} disabled={listaCategorias.length === 0}>
          Nuevo producto
        </Button>
      </div>
      {categorias.data && listaCategorias.length === 0 && (
        <p className="text-sm text-gray-500">Primero creá una categoría para poder cargar productos.</p>
      )}

      {productos.isPending && <Skeleton className="h-64" />}
      {productos.isError && (
        <EstadoError
          mensaje={getErrorMessage(productos.error, 'No se pudieron cargar los productos')}
          onReintentar={() => void productos.refetch()}
        />
      )}
      {productos.data && <DataTable table={table} paginacionCliente vacio="Todavía no hay productos" />}

      <Modal
        open={dialogo?.tipo === 'crear' || dialogo?.tipo === 'editar'}
        title={dialogo?.tipo === 'editar' ? 'Editar producto' : 'Nuevo producto'}
        onClose={cerrar}
      >
        <FormularioProducto
          categorias={listaCategorias}
          inicial={
            dialogo?.tipo === 'editar'
              ? {
                  categoria_id: String(dialogo.producto.categoria_id),
                  nombre: dialogo.producto.nombre,
                  descripcion: dialogo.producto.descripcion ?? '',
                  precio_base: String(dialogo.producto.precio_base),
                  imagen_url: dialogo.producto.imagen_url ?? '',
                  stock: String(dialogo.producto.stock),
                  disponible: dialogo.producto.disponible,
                }
              : undefined
          }
          onSubmit={guardar}
          onCancelar={cerrar}
          error={error}
        />
      </Modal>

      <Modal
        open={dialogo?.tipo === 'stock'}
        title={dialogo?.tipo === 'stock' ? `Stock de ${dialogo.producto.nombre}` : 'Stock'}
        onClose={cerrar}
      >
        {dialogo?.tipo === 'stock' && (
          <FormularioStock
            inicial={{ stock: String(dialogo.producto.stock), disponible: dialogo.producto.disponible }}
            onSubmit={guardarStock}
            onCancelar={cerrar}
            error={error}
          />
        )}
      </Modal>

      <Modal open={dialogo?.tipo === 'eliminar'} title="Eliminar producto" onClose={cerrar}>
        <p className="mb-4 text-sm text-gray-600">
          ¿Eliminar <strong>{dialogo?.tipo === 'eliminar' ? dialogo.producto.nombre : ''}</strong>? Es una baja
          lógica: deja de aparecer en el catálogo y los pedidos anteriores no se modifican.
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
