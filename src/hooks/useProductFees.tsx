import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductFee {
  id: string;
  product_id: string;
  name: string;
  description: string | null;
  amount: number;
  display_order: number;
  is_active: boolean;
  payment_message: string | null;
  button_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductFeeInsert {
  product_id: string;
  name: string;
  description?: string;
  amount: number;
  display_order?: number;
  is_active?: boolean;
  payment_message?: string;
  button_text?: string;
}

export const useProductFees = (productId: string) => {
  return useQuery({
    queryKey: ['product-fees', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_fees')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as ProductFee[];
    },
    enabled: !!productId,
  });
};

// Hook to fetch fees from all products of a client (for importing)
export const useAllClientFees = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['all-client-fees', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_fees')
        .select(`
          *,
          products!inner(id, name, client_id)
        `)
        .eq('products.client_id', clientId!)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as (ProductFee & { products: { id: string; name: string; client_id: string } })[];
    },
    enabled: !!clientId,
  });
};

export const useCreateProductFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fee: ProductFeeInsert) => {
      const { data, error } = await supabase
        .from('product_fees')
        .insert(fee)
        .select()
        .single();

      if (error) throw error;
      return data as ProductFee;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-fees', data.product_id] });
    },
  });
};

export const useUpdateProductFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductFee> & { id: string }) => {
      const { data, error } = await supabase
        .from('product_fees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ProductFee;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-fees', data.product_id] });
    },
  });
};

export const useDeleteProductFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase
        .from('product_fees')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, productId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-fees', data.productId] });
    },
  });
};
