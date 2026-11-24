import { getErrorMessage } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { Skeleton } from '../../../shared/components/Skeleton';
import { formatearPrecio } from '../../../shared/utils/forms';
import { TarjetaResumen } from '../components/TarjetaResumen';
import { useResumenPedidos } from '../hooks/usePedidos';

export function AdminResumenPage() {
  const resumen = useResumenPedidos();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Resumen del negocio</h1>

      {resumen.isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      {resumen.isError && (
        <EstadoError
          mensaje={getErrorMessage(resumen.error, 'No se pudo cargar el resumen')}
          onReintentar={() => void resumen.refetch()}
        />
      )}

      {resumen.data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen titulo="Pendientes" valor={String(resumen.data.pendientes)} acento="text-yellow-600" />
          <TarjetaResumen
            titulo="En preparación"
            valor={String(resumen.data.en_preparacion)}
            acento="text-blue-600"
          />
          <TarjetaResumen titulo="Entregados" valor={String(resumen.data.entregados)} acento="text-green-600" />
          <TarjetaResumen titulo="Cancelados" valor={String(resumen.data.cancelados)} acento="text-red-600" />
          <TarjetaResumen titulo="Pedidos de hoy" valor={String(resumen.data.pedidos_hoy)} />
          <TarjetaResumen
            titulo="Ingresos (entregados)"
            valor={formatearPrecio(resumen.data.ingresos_entregados)}
            acento="text-orange-600"
          />
        </div>
      )}
    </div>
  );
}
