import { useState } from 'react';
import { Pencil, Trash2, Plus, Loader2, AlertCircle, Package } from 'lucide-react';
import { Category, type Product } from '../backend';
import {
  useProducts,
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../hooks/useQueries';
import { CATEGORY_LABELS, ALL_CATEGORIES, formatPrice } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductFormData {
  name: string;
  category: Category;
  description: string;
  price: string;
  sizes: string;
  stock: string;
  image: string;
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  category: Category.femaleDresses,
  description: '',
  price: '',
  sizes: '',
  stock: '',
  image: '',
};

function productToForm(product: Product): ProductFormData {
  return {
    name: product.name,
    category: product.category,
    description: product.description,
    price: product.price.toString(),
    sizes: product.sizes.join(', '),
    stock: product.stock.toString(),
    image: product.image,
  };
}

function validateForm(form: ProductFormData): string | null {
  if (!form.name.trim()) return 'Product name is required.';
  if (!form.price.trim() || isNaN(Number(form.price)) || Number(form.price) < 0)
    return 'A valid price is required.';
  if (!form.stock.trim() || isNaN(Number(form.stock)) || Number(form.stock) < 0)
    return 'A valid stock quantity is required.';
  return null;
}

export function Admin() {
  const { data: products, isLoading, isError } = useProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const openAddDialog = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm(productToForm(product));
    setFormError(null);
    setDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleFormChange = (field: keyof ProductFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleSubmit = async () => {
    const error = validateForm(form);
    if (error) {
      setFormError(error);
      return;
    }

    const sizesArray = form.sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      sizes: sizesArray,
      stock: BigInt(Math.floor(Number(form.stock))),
      image: form.image.trim(),
    };

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...payload });
      } else {
        await addProduct.mutateAsync(payload);
      }
      setDialogOpen(false);
    } catch {
      setFormError('An error occurred. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProduct.mutateAsync(deletingProduct.id);
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
    } catch {
      // error handled by mutation state
    }
  };

  const isMutating = addProduct.isPending || updateProduct.isPending;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-foreground tracking-wide">
              Product Management
            </h1>
            <p className="font-sans text-sm text-muted-foreground mt-1">
              Add, edit, or remove products from the store.
            </p>
          </div>
          <Button
            onClick={openAddDialog}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans text-xs tracking-studio uppercase gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Error State */}
        {isError && (
          <div className="flex items-center gap-3 p-4 rounded border border-destructive/30 bg-destructive/10 text-destructive mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-sans text-sm">Failed to load products. Please refresh the page.</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && products?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="font-serif text-xl text-muted-foreground mb-2">No products yet</p>
            <p className="font-sans text-sm text-muted-foreground mb-6">
              Get started by adding your first product.
            </p>
            <Button
              onClick={openAddDialog}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans text-xs tracking-studio uppercase gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        )}

        {/* Products Table */}
        {!isLoading && !isError && products && products.length > 0 && (
          <div className="border border-border rounded overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40">
                  <TableHead className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead className="font-sans text-xs tracking-studio uppercase text-muted-foreground hidden sm:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
                    Price
                  </TableHead>
                  <TableHead className="font-sans text-xs tracking-studio uppercase text-muted-foreground hidden md:table-cell">
                    Stock
                  </TableHead>
                  <TableHead className="font-sans text-xs tracking-studio uppercase text-muted-foreground hidden lg:table-cell">
                    Sizes
                  </TableHead>
                  <TableHead className="font-sans text-xs tracking-studio uppercase text-muted-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id.toString()} className="hover:bg-secondary/20 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-sans text-sm font-medium text-foreground">{product.name}</p>
                        <p className="font-sans text-xs text-muted-foreground sm:hidden">
                          {CATEGORY_LABELS[product.category]}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="font-sans text-xs">
                        {CATEGORY_LABELS[product.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-sans text-sm text-accent font-medium">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span
                        className={`font-sans text-sm ${
                          Number(product.stock) === 0
                            ? 'text-destructive'
                            : Number(product.stock) < 5
                            ? 'text-warning'
                            : 'text-foreground'
                        }`}
                      >
                        {product.stock.toString()}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map((size) => (
                          <span
                            key={size}
                            className="font-sans text-xs px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(product)}
                          className="h-8 w-8 text-muted-foreground hover:text-accent"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(product)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-foreground">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="e.g. Elegant Floral Dress"
                className="font-sans text-sm"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(val) => handleFormChange('category', val as Category)}
              >
                <SelectTrigger className="font-sans text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="font-sans text-sm">
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Brief product description…"
                className="font-sans text-sm resize-none"
                rows={3}
              />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
                  Price (USD) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  placeholder="0.00"
                  className="font-sans text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
                  Stock <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) => handleFormChange('stock', e.target.value)}
                  placeholder="0"
                  className="font-sans text-sm"
                />
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
                Sizes
              </Label>
              <Input
                value={form.sizes}
                onChange={(e) => handleFormChange('sizes', e.target.value)}
                placeholder="e.g. XS, S, M, L, XL"
                className="font-sans text-sm"
              />
              <p className="font-sans text-xs text-muted-foreground">
                Comma-separated list of available sizes.
              </p>
            </div>

            {/* Image filename */}
            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
                Image Filename
              </Label>
              <Input
                value={form.image}
                onChange={(e) => handleFormChange('image', e.target.value)}
                placeholder="e.g. floral_dress.jpg"
                className="font-sans text-sm"
              />
            </div>

            {/* Form Error */}
            {formError && (
              <div className="flex items-center gap-2 text-destructive text-sm font-sans">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="font-sans text-xs tracking-studio uppercase"
                disabled={isMutating}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={isMutating}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans text-xs tracking-studio uppercase gap-2"
            >
              {isMutating && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl text-foreground">
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription className="font-sans text-sm text-muted-foreground">
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">"{deletingProduct?.name}"</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              className="font-sans text-xs tracking-studio uppercase"
              disabled={deleteProduct.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans text-xs tracking-studio uppercase gap-2"
            >
              {deleteProduct.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
