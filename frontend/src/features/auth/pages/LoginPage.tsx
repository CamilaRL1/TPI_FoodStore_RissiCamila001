import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/api/handleApiError';
import { firstError } from '../../../shared/utils/forms';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { useAuthStore } from '../../../store/authStore';
import { AuthShell } from '../components/AuthShell';

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState<string | null>(null);

  const destino = (location.state as LocationState | null)?.from?.pathname ?? '/';

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await login(value.username, value.password);
        navigate(destino, { replace: true });
      } catch (error) {
        setServerError(getErrorMessage(error, 'No se pudo iniciar sesión'));
      }
    },
  });

  return (
    <AuthShell titulo="¡Bienvenido de nuevo!" subtitulo="Ingresá para hacer tu pedido">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => (value.trim().length === 0 ? 'Ingresá tu usuario' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="Usuario"
                name="username"
                autoComplete="username"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? firstError(field.state.meta.errors) : undefined}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => (value.length === 0 ? 'Ingresá tu contraseña' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                name="password"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? firstError(field.state.meta.errors) : undefined}
              />
            )}
          </form.Field>

          {serverError && (
            <p role="alert" className="rounded-md bg-red-50 p-2 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" loading={isSubmitting}>
                Ingresar
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-orange-600 hover:underline">
            Registrate
          </Link>
        </p>
    </AuthShell>
  );
}
