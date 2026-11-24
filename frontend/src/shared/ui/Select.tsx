import type { SelectHTMLAttributes } from 'react';
import { cn } from './cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, id, className, children, ...rest }: SelectProps) {
  const selectId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'rounded-lg border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40',
          error ? 'border-red-500' : 'border-gray-300',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
