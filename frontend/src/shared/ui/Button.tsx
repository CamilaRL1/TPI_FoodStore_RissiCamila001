import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variantes: Record<Variant, string> = {
  primary: 'bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-600/30 hover:from-orange-600 hover:to-orange-700 hover:shadow-md',
  secondary: 'bg-white text-gray-800 border border-gray-300 shadow-sm hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  ghost: 'text-gray-700 hover:bg-orange-50 hover:text-orange-700',
};

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
        variantes[variant],
        className,
      )}
      {...rest}
    >
      {loading ? 'Procesando…' : children}
    </button>
  );
}
