import { cn } from '../ui/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-orange-100/70', className)} />;
}
