import { Link } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClientBalance } from '@/hooks/useClientBalance';
import { useState } from 'react';

interface DebtBannerProps {
  clientId: string;
}

export const DebtBanner = ({ clientId }: DebtBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const { data: balance } = useClientBalance(clientId);

  const debtAmount = Number(balance?.debt_amount) || 0;
  const isBlocked = balance?.is_blocked || false;

  // Don't show if no debt or dismissed
  if (debtAmount <= 0 || dismissed) {
    return null;
  }

  return (
    <div className={`${isBlocked ? 'bg-red-600' : 'bg-amber-500'} text-white px-4 py-2`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {isBlocked 
              ? `⚠️ Seu bot está suspenso! Dívida: R$ ${debtAmount.toFixed(2)}`
              : `Você tem R$ ${debtAmount.toFixed(2)} em taxas pendentes.`
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard/balance">
            <Button 
              size="sm" 
              variant={isBlocked ? 'secondary' : 'outline'}
              className={isBlocked ? '' : 'text-amber-900 border-amber-100 hover:bg-amber-100'}
            >
              Pagar Agora
            </Button>
          </Link>
          {!isBlocked && (
            <button 
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-amber-400 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
