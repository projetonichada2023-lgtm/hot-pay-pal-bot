import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import conversyLogo from "@/assets/conversy-logo.png";
import conversyIcon from "@/assets/conversy-icon.png";

interface AffiliateHeaderProps {
  affiliateName: string;
}

export const AffiliateHeader = ({ affiliateName }: AffiliateHeaderProps) => {
  const { signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <img src={conversyIcon} alt="Conversy" className="h-8 w-8 md:hidden" />
          <img src={conversyLogo} alt="Conversy" className="hidden md:block h-7" />
          <div className="hidden sm:block h-5 w-px bg-border" />
          <span className="hidden sm:block text-sm text-muted-foreground">
            Painel de Afiliados
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium hidden sm:block">{affiliateName}</span>
          <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
