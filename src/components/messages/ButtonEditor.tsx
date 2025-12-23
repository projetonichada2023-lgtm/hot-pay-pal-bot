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
import { Plus, Trash2, GripVertical, Link, MousePointerClick } from 'lucide-react';
import { MessageButton } from '@/hooks/useBotMessages';

interface ButtonEditorProps {
  buttons: MessageButton[];
  onChange: (buttons: MessageButton[]) => void;
}

const callbackOptions = [
  { value: 'products', label: '🛍️ Ver Produtos' },
  { value: 'menu', label: '📋 Menu Principal' },
  { value: 'support', label: '💬 Suporte' },
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

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-2">
        <MousePointerClick className="h-4 w-4" />
        Botões Inline
      </Label>

      {buttons.length > 0 && (
        <div className="space-y-2">
          {buttons.map((button, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg border border-border/50">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Input
                value={button.text}
                onChange={(e) => updateButton(index, 'text', e.target.value)}
                placeholder="Texto"
                className="h-8 text-sm flex-1"
              />
              <Select value={button.type} onValueChange={(v: 'callback' | 'url') => updateButton(index, 'type', v)}>
                <SelectTrigger className="h-8 text-sm w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="callback">Ação</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                </SelectContent>
              </Select>
              {button.type === 'callback' ? (
                <Select value={button.value} onValueChange={(v) => updateButton(index, 'value', v)}>
                  <SelectTrigger className="h-8 text-sm w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {callbackOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={button.value} onChange={(e) => updateButton(index, 'value', e.target.value)} placeholder="https://..." className="h-8 text-sm w-36" />
              )}
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeButton(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 p-3 bg-secondary/20 rounded-lg border border-dashed border-border/50">
        <Input value={newButtonText} onChange={(e) => setNewButtonText(e.target.value)} placeholder="Texto do botão" className="h-8 text-sm" />
        <Select value={newButtonType} onValueChange={(v: 'callback' | 'url') => { setNewButtonType(v); setNewButtonValue(v === 'callback' ? 'products' : ''); }}>
          <SelectTrigger className="h-8 text-sm w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="callback">Ação</SelectItem>
            <SelectItem value="url">URL</SelectItem>
          </SelectContent>
        </Select>
        {newButtonType === 'callback' ? (
          <Select value={newButtonValue} onValueChange={setNewButtonValue}>
            <SelectTrigger className="h-8 text-sm w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {callbackOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input value={newButtonValue} onChange={(e) => setNewButtonValue(e.target.value)} placeholder="https://..." className="h-8 text-sm w-36" />
        )}
        <Button size="sm" variant="outline" onClick={addButton} disabled={!newButtonText.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
};
