import type { InputHTMLAttributes } from 'react';
import { cn } from './cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function Checkbox({ label, id, className, ...rest }: CheckboxProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="flex items-center gap-2">
      <input
        id={inputId}
        type="checkbox"
        className={cn('h-4 w-4 rounded border-gray-300 accent-orange-600', className)}
        {...rest}
      />
      <label htmlFor={inputId} className="text-sm text-gray-700">
        {label}
      </label>
    </div>
  );
}
