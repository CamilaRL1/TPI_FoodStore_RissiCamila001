import { useForm } from '@tanstack/react-form';
import { firstError } from '../../../shared/utils/forms';
import { Button } from '../../../shared/ui/Button';
import { Checkbox } from '../../../shared/ui/Checkbox';
import { Input } from '../../../shared/ui/Input';

export interface StockFormValues {
  stock: string;
  disponible: boolean;
}

interface FormularioStockProps {
  inicial: StockFormValues;
  onSubmit: (values: StockFormValues) => Promise<void>;
  onCancelar: () => void;
  error: string | null;
}

export function FormularioStock({ inicial, onSubmit, onCancelar, error }: FormularioStockProps) {
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
        name="stock"
        validators={{
          onChange: ({ value }) => {
            if (value.trim() === '') return 'Campo obligatorio';
            const n = Number(value);
            if (!Number.isInteger(n) || n < 0) return 'Debe ser un entero mayor o igual a 0';
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            label="Stock"
            name="stock"
            type="number"
            min={0}
            step="1"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? firstError(field.state.meta.errors) : undefined}
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <Checkbox
            label="Disponible para la venta"
            name="disponible"
            checked={field.state.value}
            onChange={(e) => field.handleChange(e.target.checked)}
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
