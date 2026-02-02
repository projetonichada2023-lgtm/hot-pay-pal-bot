import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Affiliate } from "./useAffiliate";

export const useAdminAffiliates = () => {
  const queryClient = useQueryClient();

  const affiliatesQuery = useQuery({
    queryKey: ["admin-affiliates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Affiliate[];
    },
  });

  const updateAffiliateStatus = useMutation({
    mutationFn: async ({ 
      affiliateId, 
      status, 
      commissionRate 
    }: { 
      affiliateId: string; 
      status: "pending" | "approved" | "rejected" | "suspended";
      commissionRate?: number;
    }) => {
      const updateData: Record<string, unknown> = { status };
      
      if (status === "approved") {
        updateData.approved_at = new Date().toISOString();
      }
      
      if (commissionRate !== undefined) {
        updateData.commission_rate = commissionRate;
      }

      const { data, error } = await supabase
        .from("affiliates")
        .update(updateData)
        .eq("id", affiliateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
      const statusMessages = {
        approved: "Afiliado aprovado com sucesso!",
        rejected: "Afiliado rejeitado.",
        suspended: "Afiliado suspenso.",
        pending: "Status alterado para pendente.",
      };
      toast.success(statusMessages[variables.status]);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar afiliado: " + error.message);
    },
  });

  const updateCommissionRate = useMutation({
    mutationFn: async ({ 
      affiliateId, 
      commissionRate 
    }: { 
      affiliateId: string; 
      commissionRate: number;
    }) => {
      const { data, error } = await supabase
        .from("affiliates")
        .update({ commission_rate: commissionRate })
        .eq("id", affiliateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
      toast.success("Taxa de comissão atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar taxa: " + error.message);
    },
  });

  const stats = {
    total: affiliatesQuery.data?.length || 0,
    pending: affiliatesQuery.data?.filter(a => a.status === "pending").length || 0,
    approved: affiliatesQuery.data?.filter(a => a.status === "approved").length || 0,
    rejected: affiliatesQuery.data?.filter(a => a.status === "rejected").length || 0,
    suspended: affiliatesQuery.data?.filter(a => a.status === "suspended").length || 0,
    totalEarnings: affiliatesQuery.data?.reduce((acc, a) => acc + (a.total_earnings || 0), 0) || 0,
    totalReferrals: affiliatesQuery.data?.reduce((acc, a) => acc + (a.total_referrals || 0), 0) || 0,
  };

  return {
    affiliates: affiliatesQuery.data || [],
    isLoading: affiliatesQuery.isLoading,
    stats,
    updateAffiliateStatus,
    updateCommissionRate,
    refetch: affiliatesQuery.refetch,
  };
};
