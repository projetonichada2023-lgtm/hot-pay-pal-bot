import { useState } from "react";
import { useAffiliate } from "@/hooks/useAffiliate";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AffiliateOverview } from "@/components/affiliate/AffiliateOverview";
import { AffiliateLinks } from "@/components/affiliate/AffiliateLinks";
import { AffiliateCommissions } from "@/components/affiliate/AffiliateCommissions";
import { AffiliateSettings } from "@/components/affiliate/AffiliateSettings";
import { AffiliateSubAffiliates } from "@/components/affiliate/AffiliateSubAffiliates";
import { AffiliateRegister } from "@/components/affiliate/AffiliateRegister";
import { AffiliatePending } from "@/components/affiliate/AffiliatePending";
import { AffiliateHeader } from "@/components/affiliate/AffiliateHeader";
import { 
  LayoutDashboard, 
  Link2, 
  DollarSign, 
  Settings,
  LogOut,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const AffiliateDashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { affiliate, isLoading } = useAffiliate();
  const [activeTab, setActiveTab] = useState("overview");

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/affiliate/auth" replace />;
  }

  if (!affiliate) {
    return <AffiliateRegister />;
  }

  if (affiliate.status === "pending") {
    return <AffiliatePending />;
  }

  if (affiliate.status === "rejected" || affiliate.status === "suspended") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-display font-bold text-destructive mb-4">
            {affiliate.status === "rejected" ? "Cadastro Rejeitado" : "Conta Suspensa"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {affiliate.status === "rejected" 
              ? "Infelizmente seu cadastro foi rejeitado. Entre em contato com o suporte para mais informações."
              : "Sua conta foi suspensa. Entre em contato com o suporte para mais informações."}
          </p>
          <Button variant="outline" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <AffiliateHeader affiliateName={affiliate.name} />

      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold">Painel de Afiliados</h1>
          <p className="text-muted-foreground">Gerencie seus links e acompanhe suas comissões</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-5">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Links</span>
            </TabsTrigger>
            <TabsTrigger value="sub-affiliates" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Subs</span>
            </TabsTrigger>
            <TabsTrigger value="commissions" className="gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Comissões</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AffiliateOverview />
          </TabsContent>
          <TabsContent value="links">
            <AffiliateLinks />
          </TabsContent>
          <TabsContent value="sub-affiliates">
            <AffiliateSubAffiliates />
          </TabsContent>
          <TabsContent value="commissions">
            <AffiliateCommissions />
          </TabsContent>
          <TabsContent value="settings">
            <AffiliateSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AffiliateDashboard;
