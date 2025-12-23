import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Package, MessageCircle, ShoppingCart, Users, FileText, Settings, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateVariant = 
  | 'products' 
  | 'orders' 
  | 'customers' 
  | 'messages' 
  | 'chats' 
  | 'reports' 
  | 'settings'
  | 'generic';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  children?: ReactNode;
  className?: string;
}

const variantConfig: Record<EmptyStateVariant, { icon: LucideIcon; gradient: string }> = {
  products: { icon: Package, gradient: 'from-blue-500/20 to-purple-500/20' },
  orders: { icon: ShoppingCart, gradient: 'from-green-500/20 to-emerald-500/20' },
  customers: { icon: Users, gradient: 'from-orange-500/20 to-amber-500/20' },
  messages: { icon: FileText, gradient: 'from-purple-500/20 to-pink-500/20' },
  chats: { icon: MessageCircle, gradient: 'from-cyan-500/20 to-blue-500/20' },
  reports: { icon: TrendingUp, gradient: 'from-emerald-500/20 to-teal-500/20' },
  settings: { icon: Settings, gradient: 'from-slate-500/20 to-gray-500/20' },
  generic: { icon: Package, gradient: 'from-primary/20 to-primary/5' },
};

export function EmptyState({
  variant = 'generic',
  icon: CustomIcon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  children,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = CustomIcon || config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      {/* Animated Icon Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
        className="relative mb-6"
      >
        {/* Background circles */}
        <div className={cn(
          'absolute inset-0 rounded-full bg-gradient-to-br blur-xl scale-150 opacity-50',
          config.gradient
        )} />
        <div className={cn(
          'absolute inset-0 rounded-full bg-gradient-to-br scale-110',
          config.gradient
        )} />
        
        {/* Icon container */}
        <motion.div
          animate={{ 
            y: [0, -4, 0],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3, 
            ease: 'easeInOut' 
          }}
          className="relative w-24 h-24 rounded-full bg-background border border-border/50 flex items-center justify-center shadow-lg"
        >
          <Icon className="w-10 h-10 text-muted-foreground" />
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2, 
            ease: 'easeInOut' 
          }}
          className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary/40"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2.5, 
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-primary/30"
        />
      </motion.div>

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="max-w-md"
      >
        <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
      </motion.div>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel || children) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          {actionLabel && onAction && (
            <Button onClick={onAction} size="lg" className="min-w-[160px]">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button 
              onClick={onSecondaryAction} 
              variant="outline" 
              size="lg"
              className="min-w-[160px]"
            >
              {secondaryActionLabel}
            </Button>
          )}
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
