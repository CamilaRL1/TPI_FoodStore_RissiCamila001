import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/api/handleApiError';
import { firstError } from '../../../shared/utils/forms';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { AuthShell } from '../components/AuthShell';
import { useRegistrar } from '../hooks/useRegistrar';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const navigate = useNavigate();
  const registrar = useRegistrar();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmar: '' },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await registrar.mutateAsync({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        navigate('/login', { replace: true });
      } catch (error) {
        setServerError(getErrorMessage(error, 'No se pudo completar el registro'));
      }
    },
  });

  return (
    <AuthShell titulo="Crear cuenta" subtitulo="Registrate y pedí en minutos">
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
              onChange: ({ value }) => (value.trim().length < 3 ? 'Mínimo 3 caracteres' : undefined),
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
            name="full_name"
            validators={{
              onChange: ({ value }) => (value.trim().length === 0 ? 'Ingresá tu nombre completo' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="Nombre completo"
                name="full_name"
                autoComplete="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? firstError(field.state.meta.errors) : undefined}
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => (EMAIL_REGEX.test(value.trim()) ? undefined : 'Email inválido'),
            }}
          >
            {(field) => (
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
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
              onChange: ({ value }) => (value.length < 8 ? 'Mínimo 8 caracteres' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                name="password"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? firstError(field.state.meta.errors) : undefined}
              />
            )}
          </form.Field>

          <form.Field
            name="confirmar"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue('password')
                  ? 'Las contraseñas no coinciden'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Repetir contraseña"
                name="confirmar"
                type="password"
                autoComplete="new-password"
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
                Registrarme
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-orange-600 hover:underline">
            Ingresá
          </Link>
        </p>
    </AuthShell>
  );
}
