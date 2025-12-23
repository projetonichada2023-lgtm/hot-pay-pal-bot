import { useState } from 'react';
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
import { Plus, Trash2, ExternalLink, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { MessageButton } from '@/hooks/useBotMessages';
import { Badge } from '@/components/ui/badge';

interface ButtonEditorProps {
  buttons: MessageButton[];
  onChange: (buttons: MessageButton[]) => void;
}

const callbackOptions = [
  { value: 'products', label: 'Ver Produtos', icon: '🛍️' },
  { value: 'menu', label: 'Menu Principal', icon: '📋' },
  { value: 'support', label: 'Suporte', icon: '💬' },
];

export const ButtonEditor = ({ buttons, onChange }: ButtonEditorProps) => {
  const [newButtonText, setNewButtonText] = useState('');
  const [newButtonType, setNewButtonType] = useState<'callback' | 'url'>('callback');
  const [newButtonValue, setNewButtonValue] = useState('products');

  const addButton = () => {
    if (!newButtonText.trim()) return;
    onChange([...buttons, { text: newButtonText, type: newButtonType, value: newButtonValue }]);
    setNewButtonText('');
    setNewButtonValue(newButtonType === 'callback' ? 'products' : '');
  };

  const removeButton = (index: number) => onChange(buttons.filter((_, i) => i !== index));

  const updateButton = (index: number, field: keyof MessageButton, value: string) => {
    onChange(buttons.map((btn, i) => i === index ? { ...btn, [field]: value } : btn));
  };

  const moveButton = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= buttons.length) return;
    const newButtons = [...buttons];
    [newButtons[index], newButtons[newIndex]] = [newButtons[newIndex], newButtons[index]];
    onChange(newButtons);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <Label className="text-sm font-semibold">Botões Inline</Label>
            <p className="text-xs text-muted-foreground">Aparecem abaixo da mensagem</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {buttons.length} {buttons.length === 1 ? 'botão' : 'botões'}
        </Badge>
      </div>

      {/* Preview */}
      {buttons.length > 0 && (
        <div className="rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-4">
          <p className="text-xs text-muted-foreground mb-2 text-center">Preview Telegram</p>
          <div className="flex flex-col gap-1.5">
            {buttons.map((btn, idx) => (
              <button
                key={idx}
                className="w-full py-2 px-4 bg-[#3390ec] hover:bg-[#2b7bc9] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {btn.type === 'url' && <ExternalLink className="h-3.5 w-3.5" />}
                {btn.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Buttons List */}
      {buttons.length > 0 && (
        <div className="space-y-2">
          {buttons.map((button, index) => (
            <div 
              key={index} 
              className="group flex items-center gap-3 p-3 bg-card rounded-xl border border-border/60 hover:border-border transition-colors"
            >
              {/* Reorder */}
              <div className="flex flex-col gap-0.5">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 opacity-50 hover:opacity-100"
                  onClick={() => moveButton(index, 'up')}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 opacity-50 hover:opacity-100"
                  onClick={() => moveButton(index, 'down')}
                  disabled={index === buttons.length - 1}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
                    Texto
                  </Label>
                  <Input
                    value={button.text}
                    onChange={(e) => updateButton(index, 'text', e.target.value)}
                    placeholder="Ex: 🛍️ Ver Produtos"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
                    Tipo
                  </Label>
                  <Select 
                    value={button.type} 
                    onValueChange={(v: 'callback' | 'url') => {
                      updateButton(index, 'type', v);
                      if (v === 'callback') updateButton(index, 'value', 'products');
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="callback">
                        <span className="flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5" /> Ação do Bot
                        </span>
                      </SelectItem>
                      <SelectItem value="url">
                        <span className="flex items-center gap-2">
                          <ExternalLink className="h-3.5 w-3.5" /> Link Externo
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
                    {button.type === 'url' ? 'URL' : 'Ação'}
                  </Label>
                  {button.type === 'callback' ? (
                    <Select value={button.value} onValueChange={(v) => updateButton(index, 'value', v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {callbackOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.icon} {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      value={button.value} 
                      onChange={(e) => updateButton(index, 'value', e.target.value)} 
                      placeholder="https://..." 
                      className="h-9"
                    />
                  )}
                </div>
              </div>

              {/* Delete */}
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-9 w-9 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeButton(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Button */}
      <div className="rounded-xl border-2 border-dashed border-border/60 p-4 hover:border-primary/40 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-1">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Texto do Botão</Label>
            <Input 
              value={newButtonText} 
              onChange={(e) => setNewButtonText(e.target.value)} 
              placeholder="Ex: 📞 Fale Conosco"
              className="h-9"
              onKeyDown={(e) => e.key === 'Enter' && addButton()}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Tipo</Label>
            <Select 
              value={newButtonType} 
              onValueChange={(v: 'callback' | 'url') => { 
                setNewButtonType(v); 
                setNewButtonValue(v === 'callback' ? 'products' : ''); 
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="callback">Ação do Bot</SelectItem>
                <SelectItem value="url">Link Externo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              {newButtonType === 'url' ? 'URL' : 'Ação'}
            </Label>
            {newButtonType === 'callback' ? (
              <Select value={newButtonValue} onValueChange={setNewButtonValue}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {callbackOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input 
                value={newButtonValue} 
                onChange={(e) => setNewButtonValue(e.target.value)} 
                placeholder="https://wa.me/..."
                className="h-9"
              />
            )}
          </div>
          <div className="flex items-end">
            <Button 
              onClick={addButton} 
              disabled={!newButtonText.trim()}
              className="w-full h-9"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Adicionar
            </Button>
          </div>
        </div>
      </div>

      {buttons.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Adicione botões para criar interações rápidas no Telegram
        </p>
      )}
    </div>
  );
};
