import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, type Variants } from 'framer-motion';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

interface MetricCardProps {
  id: string;
  label: string;
  value: string | null;
  change: number;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  iconColor: string;
  invertColors?: boolean;
  index: number;
}

export const MetricCard = ({
  label,
  value,
  change,
  icon: IconComponent,
  iconColor,
  invertColors,
  index,
}: MetricCardProps) => {
  const isPositive = invertColors ? change <= 0 : change >= 0;

  const formatChange = (val: number) => {
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toFixed(0)}%`;
  };

  return (
    <motion.div
      className="metric-card group"
      variants={itemVariants}
      whileHover={{
        scale: 1.01,
        transition: { type: 'spring', stiffness: 400 },
      }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      </div>

      <div className="relative p-4 sm:p-5 space-y-3 sm:space-y-4">
        {/* Header with icon and change badge */}
        <div className="flex items-center justify-between">
          <motion.div
            className="p-2 sm:p-2.5 rounded-lg bg-muted/50 border border-border/50"
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.08 }}
          >
            <IconComponent className={cn('w-4 h-4 sm:w-5 sm:h-5', iconColor)} strokeWidth={1.5} />
          </motion.div>
          
          <motion.div
            className={cn(
              'flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full',
              isPositive 
                ? 'bg-success/10 text-success border border-success/20' 
                : 'bg-destructive/10 text-destructive border border-destructive/20'
            )}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.08 }}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" strokeWidth={2} />
            ) : (
              <TrendingDown className="w-3 h-3" strokeWidth={2} />
            )}
            {formatChange(change)}
          </motion.div>
        </div>

        {/* Value and Label */}
        <div className="space-y-1">
          {value === null ? (
            <Skeleton className="h-8 sm:h-10 w-24 sm:w-32 bg-muted/30" />
          ) : (
            <motion.div
              className="metric-value text-2xl sm:text-3xl text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.08 }}
            >
              {value}
            </motion.div>
          )}
          <p className="text-[11px] sm:text-sm text-muted-foreground font-medium tracking-wide truncate">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
