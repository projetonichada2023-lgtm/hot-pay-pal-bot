import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

const IMPERSONATION_KEY = 'admin_impersonation';

export const setImpersonationFlag = (adminEmail: string) => {
  localStorage.setItem(IMPERSONATION_KEY, JSON.stringify({ adminEmail, timestamp: Date.now() }));
};

export const clearImpersonationFlag = () => {
  localStorage.removeItem(IMPERSONATION_KEY);
};

export const getImpersonationFlag = () => {
  const data = localStorage.getItem(IMPERSONATION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as { adminEmail: string; timestamp: number };
  } catch {
    return null;
  }
};

export const ImpersonationBanner = () => {
  const [impersonation, setImpersonation] = useState<{ adminEmail: string } | null>(null);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const flag = getImpersonationFlag();
    setImpersonation(flag);
  }, []);

  const handleReturnToAdmin = async () => {
    clearImpersonationFlag();
    await signOut();
    navigate('/auth');
  };

  if (!impersonation) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground px-4 py-2">
      <div className="flex items-center justify-center gap-4 text-sm">
        <ShieldAlert className="w-4 h-4" />
        <span>
          Você está acessando a conta de um cliente como administrador
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleReturnToAdmin}
          className="h-7 gap-2"
        >
          <ArrowLeft className="w-3 h-3" />
          Voltar para minha conta
        </Button>
      </div>
    </div>
  );
};
