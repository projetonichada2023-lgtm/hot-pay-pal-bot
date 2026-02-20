import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Affiliate {
  id: string;
  user_id: string;
  client_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  pix_key: string | null;
  pix_key_type: string | null;
  commission_rate: number;
  status: "pending" | "approved" | "rejected" | "suspended";
  approved_at: string | null;
  total_earnings: number;
  total_referrals: number;
  parent_affiliate_id: string | null;
  sub_commission_rate: number;
  created_at: string;
  updated_at: string;
}

export interface AffiliateLink {
  id: string;
  affiliate_id: string;
  product_id: string | null;
  bot_id: string | null;
  code: string;
  clicks: number;
  conversions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AffiliateCommission {
  id: string;
  affiliate_id: string;
  order_id: string | null;
  affiliate_link_id: string | null;
  amount: number;
  status: string;
  source: string;
  sub_affiliate_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useAffiliate = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const affiliateQuery = useQuery({
    queryKey: ["affiliate", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as Affiliate | null;
    },
    enabled: !!user?.id,
  });

  const linksQuery = useQuery({
    queryKey: ["affiliate-links", affiliateQuery.data?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_links")
        .select("*")
        .eq("affiliate_id", affiliateQuery.data!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AffiliateLink[];
    },
    enabled: !!affiliateQuery.data?.id,
  });

  const commissionsQuery = useQuery({
    queryKey: ["affiliate-commissions", affiliateQuery.data?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_commissions")
        .select("*")
        .eq("affiliate_id", affiliateQuery.data!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AffiliateCommission[];
    },
    enabled: !!affiliateQuery.data?.id,
  });

  const subAffiliatesQuery = useQuery({
    queryKey: ["sub-affiliates", affiliateQuery.data?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .eq("parent_affiliate_id", affiliateQuery.data!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Affiliate[];
    },
    enabled: !!affiliateQuery.data?.id,
  });

  const registerAffiliate = useMutation({
    mutationFn: async (data: { name: string; email: string; phone?: string; pix_key?: string; pix_key_type?: string; parent_affiliate_id?: string }) => {
      const { data: affiliate, error } = await supabase
        .from("affiliates")
        .insert({
          user_id: user!.id,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          pix_key: data.pix_key || null,
          pix_key_type: data.pix_key_type || null,
          parent_affiliate_id: data.parent_affiliate_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return affiliate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate"] });
      toast.success("Cadastro de afiliado enviado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar: " + error.message);
    },
  });

  const createLink = useMutation({
    mutationFn: async (data: { product_id?: string; bot_id?: string }) => {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { data: link, error } = await supabase
        .from("affiliate_links")
        .insert({
          affiliate_id: affiliateQuery.data!.id,
          product_id: data.product_id || null,
          bot_id: data.bot_id || null,
          code,
        })
        .select()
        .single();

      if (error) throw error;
      return link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-links"] });
      toast.success("Link criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar link: " + error.message);
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: Partial<Affiliate>) => {
      const { data: updated, error } = await supabase
        .from("affiliates")
        .update(data)
        .eq("id", affiliateQuery.data!.id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate"] });
      toast.success("Perfil atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });

  // Calculate stats
  const indirectEarnings = commissionsQuery.data?.filter(c => c.source === "sub_affiliate").reduce((acc, c) => acc + c.amount, 0) || 0;
  
  const stats = {
    totalEarnings: affiliateQuery.data?.total_earnings || 0,
    totalReferrals: affiliateQuery.data?.total_referrals || 0,
    pendingCommissions: commissionsQuery.data?.filter(c => c.status === "pending").reduce((acc, c) => acc + c.amount, 0) || 0,
    paidCommissions: commissionsQuery.data?.filter(c => c.status === "paid").reduce((acc, c) => acc + c.amount, 0) || 0,
    totalClicks: linksQuery.data?.reduce((acc, l) => acc + l.clicks, 0) || 0,
    totalConversions: linksQuery.data?.reduce((acc, l) => acc + l.conversions, 0) || 0,
    conversionRate: linksQuery.data?.length 
      ? ((linksQuery.data.reduce((acc, l) => acc + l.conversions, 0) / linksQuery.data.reduce((acc, l) => acc + l.clicks, 0)) * 100) || 0
      : 0,
    indirectEarnings,
    totalSubAffiliates: subAffiliatesQuery.data?.length || 0,
  };

  return {
    affiliate: affiliateQuery.data,
    links: linksQuery.data || [],
    commissions: commissionsQuery.data || [],
    subAffiliates: subAffiliatesQuery.data || [],
    stats,
    isLoading: affiliateQuery.isLoading,
    isApproved: affiliateQuery.data?.status === "approved",
    registerAffiliate,
    createLink,
    updateProfile,
  };
};
