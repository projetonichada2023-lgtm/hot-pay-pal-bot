import { useState } from 'react';
import { MessageButton } from '@/hooks/useBotMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, GripVertical, Link, MousePointer } from 'lucide-react';

interface ButtonEditorProps {
  buttons: MessageButton[];
  onChange: (buttons: MessageButton[]) => void;
}

const CALLBACK_OPTIONS = [
  { value: 'products', label: 'Ver Produtos' },
  { value: 'menu', label: 'Menu Principal' },
  { value: 'support', label: 'Suporte' },
  { value: 'custom', label: 'Personalizado...' },
];

export const ButtonEditor = ({ buttons, onChange }: ButtonEditorProps) => {
  const [customCallback, setCustomCallback] = useState<Record<number, string>>({});

  const addButton = () => {
    onChange([...buttons, { text: 'Novo Botão', action: 'callback', value: 'products' }]);
  };

  const updateButton = (index: number, updates: Partial<MessageButton>) => {
    const newButtons = [...buttons];
    newButtons[index] = { ...newButtons[index], ...updates };
    onChange(newButtons);
  };

  const removeButton = (index: number) => {
    onChange(buttons.filter((_, i) => i !== index));
  };

  const handleCallbackChange = (index: number, value: string) => {
    if (value === 'custom') {
      setCustomCallback({ ...customCallback, [index]: buttons[index].value });
    } else {
      updateButton(index, { value });
      setCustomCallback({ ...customCallback, [index]: '' });
    }
  };

  const isCustomCallback = (index: number) => {
    const btn = buttons[index];
    return btn.action === 'callback' && !CALLBACK_OPTIONS.find(o => o.value === btn.value && o.value !== 'custom');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Botões</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addButton}
          className="h-7 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Adicionar Botão
        </Button>
      </div>

      {buttons.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          Nenhum botão configurado
        </p>
      ) : (
        <div className="space-y-2">
          {buttons.map((button, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 border border-border/50 rounded-lg bg-secondary/20"
            >
              <div className="flex-1 space-y-2">
                {/* Button text */}
                <div>
                  <Label className="text-xs text-muted-foreground">Texto do botão</Label>
                  <Input
                    value={button.text}
                    onChange={(e) => updateButton(index, { text: e.target.value })}
                    placeholder="Texto do botão"
                    className="h-8 text-sm"
                  />
                </div>

                {/* Action type */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tipo</Label>
                    <Select
                      value={button.action}
                      onValueChange={(value: 'callback' | 'url') => 
                        updateButton(index, { action: value, value: value === 'url' ? 'https://' : 'products' })
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="callback">
                          <div className="flex items-center gap-2">
                            <MousePointer className="w-3 h-3" />
                            Ação
                          </div>
                        </SelectItem>
                        <SelectItem value="url">
                          <div className="flex items-center gap-2">
                            <Link className="w-3 h-3" />
                            Link
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {button.action === 'url' ? 'URL' : 'Ação'}
                    </Label>
                    {button.action === 'url' ? (
                      <Input
                        value={button.value}
                        onChange={(e) => updateButton(index, { value: e.target.value })}
                        placeholder="https://exemplo.com"
                        className="h-8 text-sm"
                      />
                    ) : isCustomCallback(index) || customCallback[index] !== undefined ? (
                      <Input
                        value={button.value}
                        onChange={(e) => updateButton(index, { value: e.target.value })}
                        placeholder="callback_data"
                        className="h-8 text-sm"
                      />
                    ) : (
                      <Select
                        value={button.value}
                        onValueChange={(value) => handleCallbackChange(index, value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CALLBACK_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeButton(index)}
                className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {buttons.length > 0 && (
        <p className="text-xs text-muted-foreground">
          💡 Use "Ação" para ações do bot ou "Link" para abrir URLs externas
        </p>
      )}
    </div>
  );
};
