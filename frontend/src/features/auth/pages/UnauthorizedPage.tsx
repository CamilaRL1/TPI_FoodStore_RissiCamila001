import { Link } from 'react-router-dom';
import { Card } from '../../../shared/ui/Card';

export function UnauthorizedPage() {
  return (
    <Card className="mx-auto mt-10 max-w-md text-center">
      <h1 className="mb-2 text-xl font-semibold">Sin permiso</h1>
      <p className="mb-4 text-sm text-gray-600">No tenés permisos para acceder a esta sección.</p>
      <Link to="/" className="text-sm font-medium text-orange-600 hover:underline">
        Volver al inicio
      </Link>
    </Card>
  );
}
