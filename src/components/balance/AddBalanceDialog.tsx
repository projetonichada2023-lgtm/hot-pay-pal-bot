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

  const addBalance = useAddBalance();

  const handleGeneratePix = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      toast.error('Valor inválido');
      return;
    }

     const result = await addBalance.mutateAsync({ clientId, amount: value, method: 'pix' });
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
 
     const result = await addBalance.mutateAsync({ clientId, amount: value, method: 'card' });
     if (result?.invoiceUrl) {
       // Open Asaas payment page in new tab
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
    onOpenChange(false);
  };

  const suggestedAmounts = [20, 50, 100, 200];

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
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="50.00"
                  />
                </div>

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
               <div className="space-y-2">
                 <Label htmlFor="card-amount">Valor (R$)</Label>
                 <Input
                   id="card-amount"
                   type="number"
                   min="1"
                   step="0.01"
                   value={amount}
                   onChange={(e) => setAmount(e.target.value)}
                   placeholder="50.00"
                 />
               </div>
 
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
