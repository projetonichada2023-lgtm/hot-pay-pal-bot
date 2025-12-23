import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info } from 'lucide-react';

interface PlaceholderChipsProps {
  onInsert: (placeholder: string) => void;
}

const placeholders = [
  { key: '{nome}', label: 'Nome', description: 'Nome completo do cliente' },
  { key: '{primeiro_nome}', label: 'Primeiro Nome', description: 'Primeiro nome do cliente' },
  { key: '{produto}', label: 'Produto', description: 'Nome do produto' },
  { key: '{valor}', label: 'Valor', description: 'Valor do produto/pedido' },
  { key: '{pix_code}', label: 'Código PIX', description: 'Código PIX para pagamento' },
  { key: '{pedido_id}', label: 'ID Pedido', description: 'Identificador único do pedido' },
];

export const PlaceholderChips = ({ onInsert }: PlaceholderChipsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Info className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 text-xs" side="top">
            <p className="font-medium mb-2">Variáveis Dinâmicas</p>
            <p className="text-muted-foreground">
              Clique em uma variável para inserir no texto. Elas serão substituídas automaticamente pelo bot.
            </p>
          </PopoverContent>
        </Popover>
        <span>Variáveis:</span>
      </div>
      {placeholders.map((p) => (
        <Badge
          key={p.key}
          variant="outline"
          className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors text-xs font-mono"
          onClick={() => onInsert(p.key)}
          title={p.description}
        >
          {p.label}
        </Badge>
      ))}
    </div>
  );
};
