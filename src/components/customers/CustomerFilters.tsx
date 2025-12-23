import { CustomerFilters as Filters } from '@/hooks/useCustomers';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface CustomerFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export const CustomerFilters = ({ filters, onFiltersChange }: CustomerFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, username, email..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>

      <Select
        value={filters.hasOrders}
        onValueChange={(value: Filters['hasOrders']) => 
          onFiltersChange({ ...filters, hasOrders: value })
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrar pedidos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os clientes</SelectItem>
          <SelectItem value="with_orders">Com pedidos</SelectItem>
          <SelectItem value="no_orders">Sem pedidos</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.sortBy}
        onValueChange={(value: Filters['sortBy']) => 
          onFiltersChange({ ...filters, sortBy: value })
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Mais recentes</SelectItem>
          <SelectItem value="oldest">Mais antigos</SelectItem>
          <SelectItem value="most_orders">Mais pedidos</SelectItem>
          <SelectItem value="highest_spent">Maior gasto</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
