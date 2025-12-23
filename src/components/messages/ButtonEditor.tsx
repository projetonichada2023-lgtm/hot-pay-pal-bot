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
    <div className="space-y-3 sm:space-y-4 border border-border/40 rounded-xl p-3 sm:p-4 bg-secondary/20">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <Label className="text-xs sm:text-sm font-semibold">Botões Inline</Label>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Aparecem abaixo da mensagem</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
          {buttons.length} {buttons.length === 1 ? 'botão' : 'botões'}
        </Badge>
      </div>

      {/* Preview - Compact on mobile */}
      {buttons.length > 0 && (
        <div className="rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-zinc-400 mb-2 text-center">Preview Telegram</p>
          <div className="flex flex-col gap-1 sm:gap-1.5">
            {buttons.map((btn, idx) => (
              <div
                key={idx}
                className="w-full py-1.5 sm:py-2 px-3 sm:px-4 bg-[#3390ec] text-white text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 sm:gap-2"
              >
                {btn.type === 'url' && <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                <span className="truncate">{btn.text}</span>
              </div>
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
              className="group p-2 sm:p-3 bg-card rounded-xl border border-border/60 hover:border-border transition-colors"
            >
              {/* Mobile: Stack layout */}
              <div className="flex items-start gap-2 sm:hidden">
                <div className="flex flex-col gap-0.5 pt-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 opacity-70"
                    onClick={() => moveButton(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 opacity-70"
                    onClick={() => moveButton(index, 'down')}
                    disabled={index === buttons.length - 1}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex-1 space-y-2 min-w-0">
                  <Input
                    value={button.text}
                    onChange={(e) => updateButton(index, 'text', e.target.value)}
                    placeholder="Texto do botão"
                    className="h-8 text-sm"
                  />
                  <div className="flex gap-2">
                    <Select 
                      value={button.type} 
                      onValueChange={(v: 'callback' | 'url') => {
                        updateButton(index, 'type', v);
                        if (v === 'callback') updateButton(index, 'value', 'products');
                      }}
                    >
                      <SelectTrigger className="h-8 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="callback">Ação</SelectItem>
                        <SelectItem value="url">Link</SelectItem>
                      </SelectContent>
                    </Select>
                    {button.type === 'callback' ? (
                      <Select value={button.value} onValueChange={(v) => updateButton(index, 'value', v)}>
                        <SelectTrigger className="h-8 flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
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
                        className="h-8 flex-1"
                      />
                    )}
                  </div>
                </div>

                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => removeButton(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Desktop: Horizontal layout */}
              <div className="hidden sm:flex items-center gap-3">
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

                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
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
                      <SelectContent className="bg-popover">
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
                        <SelectContent className="bg-popover">
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

                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-9 w-9 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeButton(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Button */}
      <div className="rounded-xl border-2 border-dashed border-border/60 p-3 sm:p-4 hover:border-primary/40 transition-colors">
        {/* Mobile: Stacked layout */}
        <div className="sm:hidden space-y-2">
          <Input 
            value={newButtonText} 
            onChange={(e) => setNewButtonText(e.target.value)} 
            placeholder="Texto do botão (ex: 📞 Fale Conosco)"
            className="h-9"
            onKeyDown={(e) => e.key === 'Enter' && addButton()}
          />
          <div className="flex gap-2">
            <Select 
              value={newButtonType} 
              onValueChange={(v: 'callback' | 'url') => { 
                setNewButtonType(v); 
                setNewButtonValue(v === 'callback' ? 'products' : ''); 
              }}
            >
              <SelectTrigger className="h-9 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="callback">Ação</SelectItem>
                <SelectItem value="url">Link</SelectItem>
              </SelectContent>
            </Select>
            {newButtonType === 'callback' ? (
              <Select value={newButtonValue} onValueChange={setNewButtonValue}>
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
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
                placeholder="https://..."
                className="h-9 flex-1"
              />
            )}
          </div>
          <Button 
            onClick={addButton} 
            disabled={!newButtonText.trim()}
            className="w-full h-9"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Adicionar Botão
          </Button>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden sm:grid grid-cols-4 gap-3">
          <div>
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
              <SelectContent className="bg-popover">
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
                <SelectContent className="bg-popover">
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
        <p className="text-[10px] sm:text-xs text-muted-foreground text-center py-1 sm:py-2">
          Adicione botões para criar interações rápidas no Telegram
        </p>
      )}
    </div>
  );
};
