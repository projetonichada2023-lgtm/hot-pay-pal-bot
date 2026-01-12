import { useState } from 'react';
import { Client } from '@/hooks/useClient';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from '@/hooks/useProducts';
import { useCreateProductFee } from '@/hooks/useProductFees';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus, Loader2, Lock, Download } from 'lucide-react';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductForm, ProductFormData } from '@/components/products/ProductForm';
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog';
import { PendingFee } from '@/components/products/PendingFeesManager';
import { toast } from 'sonner';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { Badge } from '@/components/ui/badge';
import { exportProducts } from '@/lib/export-csv';
import { useBotContext } from '@/contexts/BotContext';

interface ProductsPageProps {
  client: Client;
}

export const ProductsPage = ({ client }: ProductsPageProps) => {
  const { selectedBot } = useBotContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useProducts(client.id, selectedBot?.id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createFee = useCreateProductFee();
  const { canAddProduct, getRemainingProducts, showLimitReachedToast, planLimits } = usePlanLimits();

  const handleCreate = () => {
    if (!canAddProduct()) {
      showLimitReachedToast("produtos");
      return;
    }
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: ProductFormData, pendingFees?: PendingFee[]) => {
    try {
      if (selectedProduct) {
        await updateProduct.mutateAsync({
          id: selectedProduct.id,
          clientId: client.id,
          name: data.name,
          description: data.description || null,
          price: data.price,
          image_url: data.image_url || null,
          file_url: data.file_url || null,
          telegram_group_id: data.telegram_group_id || null,
          is_active: data.is_active,
          is_hot: data.is_hot,
        } as any);
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Create the product first
        const newProduct = await createProduct.mutateAsync({
          client_id: client.id,
          bot_id: selectedBot?.id || null,
          name: data.name,
          description: data.description || null,
          price: data.price,
          image_url: data.image_url || null,
          file_url: data.file_url || null,
          telegram_group_id: data.telegram_group_id || null,
          is_active: data.is_active,
          is_hot: data.is_hot,
          require_fees_before_delivery: data.require_fees_before_delivery,
        } as any);

        // Create pending fees if any
        if (pendingFees && pendingFees.length > 0) {
          await Promise.all(
            pendingFees.map((fee, index) =>
              createFee.mutateAsync({
                product_id: newProduct.id,
                name: fee.name,
                amount: fee.amount,
                description: fee.description || undefined,
                payment_message: fee.payment_message || undefined,
                button_text: fee.button_text || undefined,
                display_order: index + 1,
                is_active: fee.is_active,
              })
            )
          );
        }

        toast.success('Produto criado com sucesso!');
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar produto');
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProduct.mutateAsync({ id: selectedProduct.id, clientId: client.id });
      toast.success('Produto excluído com sucesso!');
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error('Erro ao excluir produto');
      console.error(error);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            Produtos
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus produtos digitais
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {planLimits && planLimits.max_products !== -1 && (
            <Badge variant="outline" className="text-muted-foreground text-xs">
              {products?.length || 0} / {planLimits.max_products}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              if (!products || products.length === 0) {
                toast.error('Nenhum produto para exportar');
                return;
              }
              exportProducts(products);
              toast.success('Exportação concluída!');
            }}
            disabled={!products || products.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Exportar</span> CSV
          </Button>
          <Button onClick={handleCreate} disabled={!canAddProduct()} size="sm" className="flex-1 sm:flex-none">
            {!canAddProduct() ? (
              <Lock className="w-4 h-4 mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            <span className="hidden sm:inline">Novo</span> Produto
          </Button>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader className="p-3 md:p-6 pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Catálogo de Produtos</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ProductsTable
              products={products || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddProduct={handleCreate}
            />
          )}
        </CardContent>
      </Card>

      <ProductForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        product={selectedProduct}
        isLoading={createProduct.isPending || updateProduct.isPending}
      />

      <DeleteProductDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
        product={selectedProduct}
        isLoading={deleteProduct.isPending}
      />
    </div>
  );
};
