import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, LucideIcon } from 'lucide-react';
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
  gradient,
  iconBg,
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
      className="metric-card"
      variants={itemVariants}
      whileHover={{
        scale: 1.02,
        y: -4,
        transition: { type: 'spring', stiffness: 400 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn('absolute inset-0 opacity-50 pointer-events-none', `bg-gradient-to-br ${gradient}`)} />
      <div className="relative p-3 sm:p-5 space-y-2 sm:space-y-4">
        <div className="flex items-center justify-between">
          <motion.div
            className={cn('p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl backdrop-blur-sm', iconBg)}
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <IconComponent className={cn('w-4 h-4 sm:w-5 sm:h-5', iconColor)} />
          </motion.div>
          <motion.div
            className={cn(
              'flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full backdrop-blur-sm',
              isPositive ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
            )}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            {isPositive ? (
              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            ) : (
              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 rotate-180" />
            )}
            {formatChange(change)}
          </motion.div>
        </div>
        <div>
          {value === null ? (
            <Skeleton className="h-6 sm:h-10 w-20 sm:w-28 mb-1" />
          ) : (
            <motion.div
              className="text-lg sm:text-3xl font-bold tracking-tight text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + index * 0.1 }}
            >
              {value}
            </motion.div>
          )}
          <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};
