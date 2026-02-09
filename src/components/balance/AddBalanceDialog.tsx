import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, CreditCard, Copy, Check, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useAddBalance } from '@/hooks/useClientBalance';

interface AddBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  currentDebt: number;
}

const formatCpfCnpj = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

export const AddBalanceDialog = ({
  open,
  onOpenChange,
  clientId,
  currentDebt,
}: AddBalanceDialogProps) => {
  const [amount, setAmount] = useState<string>(currentDebt > 0 ? currentDebt.toFixed(2) : '50.00');
  const [pixData, setPixData] = useState<{ pixCode: string; pixQrcode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('pix');
  const [cpfCnpj, setCpfCnpj] = useState('');

  const addBalance = useAddBalance();

  const validateCpfCnpj = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.length === 11 || digits.length === 14;
  };

  const handleGeneratePix = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      toast.error('Valor inválido');
      return;
    }
    if (!validateCpfCnpj(cpfCnpj)) {
      toast.error('Informe um CPF ou CNPJ válido');
      return;
    }

    const result = await addBalance.mutateAsync({
      clientId,
      amount: value,
      method: 'pix',
      cpfCnpj: cpfCnpj.replace(/\D/g, ''),
    });
    if (result?.pixCode) {
      setPixData({ pixCode: result.pixCode, pixQrcode: result.pixQrcode });
    }
  };

  const handlePayWithCard = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      toast.error('Valor inválido');
      return;
    }
    if (!validateCpfCnpj(cpfCnpj)) {
      toast.error('Informe um CPF ou CNPJ válido');
      return;
    }

    const result = await addBalance.mutateAsync({
      clientId,
      amount: value,
      method: 'card',
      cpfCnpj: cpfCnpj.replace(/\D/g, ''),
    });
    if (result?.invoiceUrl) {
      window.open(result.invoiceUrl, '_blank');
      toast.success('Página de pagamento aberta! Complete o pagamento e seu saldo será atualizado automaticamente.');
      handleClose();
    }
  };

  const handleCopyPix = () => {
    if (pixData?.pixCode) {
      navigator.clipboard.writeText(pixData.pixCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleClose = () => {
    setPixData(null);
    setCopied(false);
    setCpfCnpj('');
    onOpenChange(false);
  };

  const suggestedAmounts = [20, 50, 100, 200];

  const CpfCnpjField = ({ id }: { id: string }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>CPF ou CNPJ</Label>
      <Input
        id={id}
        value={cpfCnpj}
        onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
        placeholder="000.000.000-00"
        maxLength={18}
      />
    </div>
  );

  const AmountField = ({ id }: { id: string }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>Valor (R$)</Label>
      <Input
        id={id}
        type="number"
        min="1"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="50.00"
      />
    </div>
  );

  const SuggestedAmounts = () => (
    <div className="flex flex-wrap gap-2">
      {suggestedAmounts.map((val) => (
        <Button
          key={val}
          variant="outline"
          size="sm"
          onClick={() => setAmount(val.toFixed(2))}
          className={amount === val.toFixed(2) ? 'border-primary' : ''}
        >
          R$ {val}
        </Button>
      ))}
      {currentDebt > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAmount(currentDebt.toFixed(2))}
          className={`text-red-600 ${amount === currentDebt.toFixed(2) ? 'border-red-500' : ''}`}
        >
          Pagar dívida
        </Button>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>💰 Adicionar Saldo</DialogTitle>
          <DialogDescription>
            Adicione saldo para pagar suas taxas de plataforma automaticamente.
            {currentDebt > 0 && (
              <span className="block mt-1 text-red-500 font-medium">
                Dívida atual: R$ {currentDebt.toFixed(2)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pix" className="gap-2">
              <QrCode className="h-4 w-4" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="card" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Cartão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pix" className="space-y-4 mt-4">
            {!pixData ? (
              <>
                <CpfCnpjField id="cpf-pix" />
                <AmountField id="amount-pix" />
                <SuggestedAmounts />

                <Button 
                  className="w-full" 
                  onClick={handleGeneratePix}
                  disabled={addBalance.isPending}
                >
                  {addBalance.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Gerar PIX
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img 
                    src={pixData.pixQrcode} 
                    alt="QR Code PIX" 
                    className="w-48 h-48 rounded-lg border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Código PIX (Copia e Cola)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={pixData.pixCode}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyPix}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Escaneie o QR Code ou copie o código para pagar.</p>
                  <p className="font-medium mt-1">Valor: R$ {amount}</p>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setPixData(null)}
                >
                  Gerar outro PIX
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="card" className="mt-4">
            <div className="space-y-4">
              <CpfCnpjField id="cpf-card" />
              <AmountField id="amount-card" />
              <SuggestedAmounts />

              <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <p>Você será redirecionado para uma página segura de pagamento onde poderá inserir os dados do seu cartão.</p>
              </div>

              <Button 
                className="w-full" 
                onClick={handlePayWithCard}
                disabled={addBalance.isPending}
              >
                {addBalance.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Pagar com Cartão
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
