import axios from 'axios';

/** Extrae el `detail` de la respuesta de error de la API (string o lista de errores 422). */
export function extractDetail(data: unknown): string | null {
  if (typeof data !== 'object' || data === null || !('detail' in data)) return null;
  const detail: unknown = data.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const mensajes: string[] = [];
    for (const item of detail as unknown[]) {
      if (typeof item === 'object' && item !== null && 'msg' in item && typeof item.msg === 'string') {
        mensajes.push(item.msg);
      }
    }
    return mensajes.length > 0 ? mensajes.join('. ') : null;
  }
  return null;
}

/** Convierte cualquier error en un mensaje legible para mostrar en pantalla. */
export function getErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado',
): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor';
    return extractDetail(error.response.data) ?? fallback;
  }
  return fallback;
}
