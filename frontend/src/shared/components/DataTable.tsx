import { flexRender } from '@tanstack/react-table';
import type { Table } from '@tanstack/react-table';
import { Button } from '../ui/Button';

interface DataTableProps<T> {
  table: Table<T>;
  /** Muestra los controles de paginación del lado del cliente (getPaginationRowModel). */
  paginacionCliente?: boolean;
  vacio?: string;
}

export function DataTable<T>({ table, paginacionCliente = false, vacio = 'Sin resultados' }: DataTableProps<T>) {
  const filas = table.getRowModel().rows;
  const columnas = table.getAllLeafColumns().length;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-orange-50/60 text-xs uppercase tracking-wide text-gray-600">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th key={header.id} className="px-3 py-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan={columnas} className="px-3 py-8 text-center text-gray-500">
                  {vacio}
                </td>
              </tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.id} className="border-t border-gray-100 transition-colors hover:bg-orange-50/40">
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-3 py-2 align-middle">
                      {flexRender(celda.column.columnDef.cell, celda.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginacionCliente && table.getPageCount() > 1 && (
        <div className="flex items-center justify-center gap-4 border-t border-gray-100 py-3">
          <Button variant="secondary" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </span>
          <Button variant="secondary" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
