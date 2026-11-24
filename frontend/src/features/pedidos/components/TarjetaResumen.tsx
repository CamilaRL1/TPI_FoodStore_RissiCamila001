import { Card } from '../../../shared/ui/Card';
import { cn } from '../../../shared/ui/cn';

interface TarjetaResumenProps {
  titulo: string;
  valor: string;
  acento?: string;
}

export function TarjetaResumen({ titulo, valor, acento = 'text-gray-900' }: TarjetaResumenProps) {
  return (
    <Card className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{titulo}</p>
      <p className={cn('text-3xl font-bold', acento)}>{valor}</p>
    </Card>
  );
}
