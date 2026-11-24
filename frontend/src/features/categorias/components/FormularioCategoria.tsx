import { useForm } from '@tanstack/react-form';
import { firstError } from '../../../shared/utils/forms';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Textarea } from '../../../shared/ui/Textarea';

export interface CategoriaFormValues {
  nombre: string;
  descripcion: string;
}

interface FormularioCategoriaProps {
  inicial?: CategoriaFormValues;
  onSubmit: (values: CategoriaFormValues) => Promise<void>;
  onCancelar: () => void;
  error: string | null;
}

const vacio: CategoriaFormValues = { nombre: '', descripcion: '' };

export function FormularioCategoria({ inicial = vacio, onSubmit, onCancelar, error }: FormularioCategoriaProps) {
  const form = useForm({
    defaultValues: inicial,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 2) return 'El nombre debe tener al menos 2 caracteres';
            if (largo > 100) return 'El nombre no puede superar los 100 caracteres';
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            label="Nombre"
            name="nombre"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? firstError(field.state.meta.errors) : undefined}
          />
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <Textarea
            label="Descripción (opcional)"
            name="descripcion"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" loading={isSubmitting}>
              Guardar
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
