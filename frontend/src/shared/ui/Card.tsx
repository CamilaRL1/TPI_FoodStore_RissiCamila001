import type { HTMLAttributes } from 'react';
import { cn } from './cn';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm', className)} {...rest}>
      {children}
    </div>
  );
}
