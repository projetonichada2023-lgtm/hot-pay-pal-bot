import { useState } from 'react';
import { Client } from '@/hooks/useClient';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus, Loader2 } from 'lucide-react';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductForm, ProductFormData } from '@/components/products/ProductForm';
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog';
import { toast } from 'sonner';

interface ProductsPageProps {
  client: Client;
}

export const ProductsPage = ({ client }: ProductsPageProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useProducts(client.id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleCreate = () => {
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

  const handleSubmit = async (data: ProductFormData) => {
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
        await createProduct.mutateAsync({
          client_id: client.id,
          name: data.name,
          description: data.description || null,
          price: data.price,
          image_url: data.image_url || null,
          file_url: data.file_url || null,
          telegram_group_id: data.telegram_group_id || null,
          is_active: data.is_active,
          is_hot: data.is_hot,
        } as any);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Produtos
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos digitais
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Catálogo de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ProductsTable
              products={products || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
