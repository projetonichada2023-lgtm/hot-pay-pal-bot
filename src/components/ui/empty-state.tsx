import { ReactNode } from 'react';
import { LucideIcon, Package, ShoppingCart, Users, FileText, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
};

// Pre-configured empty states for common use cases
export const EmptyProducts = ({ onAddProduct }: { onAddProduct?: () => void }) => (
  <EmptyState
    icon={Package}
    title="Nenhum produto cadastrado"
    description="Comece adicionando seu primeiro produto para vendê-lo pelo bot do Telegram."
    action={onAddProduct ? { label: 'Adicionar Produto', onClick: onAddProduct } : undefined}
  />
);

export const EmptyOrders = () => (
  <EmptyState
    icon={ShoppingCart}
    title="Nenhum pedido encontrado"
    description="Os pedidos aparecerão aqui quando seus clientes realizarem compras pelo bot."
  />
);

export const EmptyCustomers = () => (
  <EmptyState
    icon={Users}
    title="Nenhum cliente encontrado"
    description="Clientes aparecerão aqui quando interagirem com seu bot do Telegram."
  />
);

export const EmptyEvents = () => (
  <EmptyState
    icon={FileText}
    title="Nenhum evento registrado"
    description="Eventos de tracking aparecerão aqui quando o pixel começar a rastrear conversões."
  />
);
