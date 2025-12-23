import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export const NotificationBadge = ({ count, className }: NotificationBadgeProps) => {
  if (count === 0) return null;

  return (
    <span
      className={cn(
        'absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full',
        'bg-destructive text-destructive-foreground text-[10px] font-bold',
        'flex items-center justify-center animate-pulse-glow',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};
