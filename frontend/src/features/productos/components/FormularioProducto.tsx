import { useForm } from '@tanstack/react-form';
import { firstError } from '../../../shared/utils/forms';
import { Button } from '../../../shared/ui/Button';
import { Checkbox } from '../../../shared/ui/Checkbox';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { Textarea } from '../../../shared/ui/Textarea';
import type { Categoria } from '../../categorias';

export interface ProductoFormValues {
  categoria_id: string;
  nombre: string;
  descripcion: string;
  precio_base: string;
  imagen_url: string;
  stock: string;
  disponible: boolean;
}

interface FormularioProductoProps {
  categorias: Categoria[];
  inicial?: ProductoFormValues;
  onSubmit: (values: ProductoFormValues) => Promise<void>;
  onCancelar: () => void;
  error: string | null;
}

const vacio: ProductoFormValues = {
  categoria_id: '',
  nombre: '',
  descripcion: '',
  precio_base: '',
  imagen_url: '',
  stock: '0',
  disponible: true,
};

function validarNumero(valor: string, entero: boolean): string | undefined {
  if (valor.trim() === '') return 'Campo obligatorio';
  const n = Number(valor);
  if (Number.isNaN(n) || n < 0) return 'Debe ser un número mayor o igual a 0';
  if (entero && !Number.isInteger(n)) return 'Debe ser un número entero';
  return undefined;
}

export function FormularioProducto({
  categorias,
  inicial = vacio,
  onSubmit,
  onCancelar,
  error,
}: FormularioProductoProps) {
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
          onChange: ({ value }) => (value.trim().length === 0 ? 'El nombre es obligatorio' : undefined),
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

      <form.Field
        name="categoria_id"
        validators={{
          onChange: ({ value }) => (value === '' ? 'Elegí una categoría' : undefined),
        }}
      >
        {(field) => (
          <Select
            label="Categoría"
            name="categoria_id"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? firstError(field.state.meta.errors) : undefined}
          >
            <option value="">Seleccionar…</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="precio_base" validators={{ onChange: ({ value }) => validarNumero(value, false) }}>
          {(field) => (
            <Input
              label="Precio"
              name="precio_base"
              type="number"
              min={0}
              step="0.01"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.isTouched ? firstError(field.state.meta.errors) : undefined}
            />
          )}
        </form.Field>

        <form.Field name="stock" validators={{ onChange: ({ value }) => validarNumero(value, true) }}>
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
      </div>

      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="URL de la imagen (opcional)"
            name="imagen_url"
            type="url"
            placeholder="https://…"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
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
