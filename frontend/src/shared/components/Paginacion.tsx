import { Button } from '../ui/Button';

interface PaginacionProps {
  skip: number;
  limit: number;
  total: number;
  onChange: (nuevoSkip: number) => void;
}

export function Paginacion({ skip, limit, total, onChange }: PaginacionProps) {
  const pagina = Math.floor(skip / limit) + 1;
  const paginas = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <Button variant="secondary" disabled={pagina <= 1} onClick={() => onChange(Math.max(0, skip - limit))}>
        Anterior
      </Button>
      <span className="text-sm text-gray-600">
        Página {pagina} de {paginas}
      </span>
      <Button variant="secondary" disabled={pagina >= paginas} onClick={() => onChange(skip + limit)}>
        Siguiente
      </Button>
    </div>
  );
}
