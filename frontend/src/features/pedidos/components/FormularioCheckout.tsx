import { useForm } from '@tanstack/react-form';
import { firstError } from '../../../shared/utils/forms';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { Textarea } from '../../../shared/ui/Textarea';
import { esFormaPago, FORMAS_PAGO } from '../constants';
import type { FormaPago } from '../types';

export interface CheckoutValues {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

interface FormularioCheckoutProps {
  onSubmit: (values: CheckoutValues) => Promise<void>;
  error: string | null;
}

const valoresIniciales: CheckoutValues = {
  direccion_entrega: '',
  forma_pago: 'EFECTIVO',
  notas: '',
};

export function FormularioCheckout({ onSubmit, error }: FormularioCheckoutProps) {
  const form = useForm({
    defaultValues: valoresIniciales,
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
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 5) return 'La dirección debe tener al menos 5 caracteres';
            if (largo > 200) return 'La dirección no puede superar los 200 caracteres';
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            name="direccion_entrega"
            autoComplete="street-address"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? firstError(field.state.meta.errors) : undefined}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <Select
            label="Forma de pago"
            name="forma_pago"
            value={field.state.value}
            onChange={(e) => {
              const valor = e.target.value;
              if (esFormaPago(valor)) field.handleChange(valor);
            }}
          >
            {FORMAS_PAGO.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <form.Field name="notas">
        {(field) => (
          <Textarea
            label="Notas (opcional)"
            name="notas"
            placeholder="Ej: sin cebolla, tocar timbre 2B"
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

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" loading={isSubmitting}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
