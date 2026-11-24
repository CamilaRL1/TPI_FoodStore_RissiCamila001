/** Primer mensaje de error de un campo de TanStack Form (o undefined). */
export function firstError(errors: ReadonlyArray<unknown>): string | undefined {
  for (const error of errors) {
    if (typeof error === 'string' && error.length > 0) return error;
  }
  return undefined;
}

export function formatearPrecio(valor: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
}

/** El backend devuelve fechas en UTC sin sufijo de zona: se interpretan como UTC. */
export function formatearFecha(iso: string): string {
  const tieneZona = /(Z|[+-]\d{2}:\d{2})$/.test(iso);
  const fecha = new Date(tieneZona ? iso : `${iso}Z`);
  return fecha.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}
