import { useState, useRef } from 'react';
import {
  Pencil,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  Package,
  Upload,
  X,
  ImageIcon,
  Lock,
  FileText,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Category, type Product } from '../backend';
import {
  useProducts,
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
  useGetStoreContent,
  useUpdateStoreContent,
  useIsCallerAdmin,
  useClaimInitialAdmin,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
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
import { Separator } from '@/components/ui/separator';

// Max dimensions for resized image (keeps file size small enough for ICP)
const MAX_IMAGE_WIDTH = 600;
const MAX_IMAGE_HEIGHT = 800;
const IMAGE_QUALITY = 0.75;

/**
 * Resize and compress an image file using Canvas API.
 * Returns a base64 data URI string.
 */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
        const widthRatio = MAX_IMAGE_WIDTH / width;
        const heightRatio = MAX_IMAGE_HEIGHT / height;
        const ratio = Math.min(widthRatio, heightRatio);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const base64 = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
      resolve(base64);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

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

// ─── Access Denied / Claim Admin Screen ──────────────────────────────────────
function AccessDenied({ reason }: { reason: 'unauthenticated' | 'not-admin' }) {
  const claimAdmin = useClaimInitialAdmin();
  const [claimError, setClaimError] = useState<string | null>(null);

  const handleClaim = async () => {
    setClaimError(null);
    try {
      await claimAdmin.mutateAsync();
    } catch (err) {
      setClaimError(
        err instanceof Error ? err.message : 'Failed to claim admin access. Please try again.',
      );
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
          <Lock className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-2xl text-foreground mb-3">Access Restricted</h1>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6">
          {reason === 'unauthenticated'
            ? 'You must be logged in to access the admin panel. Please log in using the menu.'
            : 'Your account does not have admin privileges to access this page.'}
        </p>

        {/* Claim Admin button — only shown for authenticated non-admin users */}
        {reason === 'not-admin' && (
          <div className="space-y-3">
            <Button
              onClick={handleClaim}
              disabled={claimAdmin.isPending}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans text-xs tracking-widest uppercase gap-2 w-full"
            >
              {claimAdmin.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Claiming Access…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Claim Admin Access
                </>
              )}
            </Button>
            <p className="font-sans text-xs text-muted-foreground">
              If no admin has been assigned yet, you can claim admin rights for this store.
            </p>
            {claimError && (
              <div className="flex items-center gap-2 p-3 rounded border border-destructive/30 bg-destructive/10 text-destructive text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="font-sans text-xs">{claimError}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Content Management Section ───────────────────────────────────────────────
function ContentManagement() {
  const { data: storeContent, isLoading: contentLoading } = useGetStoreContent();
  const updateContent = useUpdateStoreContent();

  const [heroText, setHeroText] = useState('');
  const [heroBanner, setHeroBanner] = useState('');
  const [aboutPageCopy, setAboutPageCopy] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Populate form once data loads
  if (storeContent && !initialized) {
    setHeroText(storeContent.heroText);
    setHeroBanner(storeContent.heroBanner);
    setAboutPageCopy(storeContent.aboutPageCopy);
    setInitialized(true);
  }

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateContent.mutateAsync({ heroText, heroBanner, aboutPageCopy });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save content.');
    }
  };

  return (
    <section className="mt-12">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-accent" />
          <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide">
            Content Management
          </h2>
        </div>
        <p className="font-sans text-sm text-muted-foreground">
          Edit the homepage hero text and About page copy.
        </p>
      </div>

      {contentLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-32 w-full rounded" />
        </div>
      ) : (
        <div className="border border-border rounded p-6 bg-background space-y-5">
          {/* Hero Text */}
          <div className="space-y-1.5">
            <Label className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
              Homepage Hero Text
            </Label>
            <Input
              value={heroText}
              onChange={(e) => setHeroText(e.target.value)}
              placeholder="e.g. Crafted for the moments that matter"
              className="font-sans text-sm"
            />
            <p className="font-sans text-xs text-muted-foreground">
              Displayed as the main headline on the homepage.
            </p>
          </div>

          {/* Hero Banner */}
          <div className="space-y-1.5">
            <Label className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
              Hero Banner Subtext
            </Label>
            <Input
              value={heroBanner}
              onChange={(e) => setHeroBanner(e.target.value)}
              placeholder="e.g. New Collection 2026"
              className="font-sans text-sm"
            />
            <p className="font-sans text-xs text-muted-foreground">
              Displayed as a subtitle or banner label on the homepage.
            </p>
          </div>

          {/* About Page Copy */}
          <div className="space-y-1.5">
            <Label className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
              About Page Copy
            </Label>
            <Textarea
              value={aboutPageCopy}
              onChange={(e) => setAboutPageCopy(e.target.value)}
              placeholder="Tell your brand story here..."
              className="font-sans text-sm resize-none"
              rows={6}
            />
            <p className="font-sans text-xs text-muted-foreground">
              Displayed on the About Us page. Use line breaks to separate paragraphs.
            </p>
          </div>

          {/* Feedback */}
          {saveError && (
            <div className="flex items-center gap-2 p-3 rounded border border-destructive/30 bg-destructive/10 text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="font-sans text-sm">{saveError}</p>
            </div>
          )}
          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 rounded border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <p className="font-sans text-sm">Content saved successfully!</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={updateContent.isPending}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans text-xs tracking-studio uppercase gap-2"
            >
              {updateContent.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Content'
              )}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Main Admin Component ─────────────────────────────────────────────────────
export function Admin() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();

  const { data: products, isLoading, isError } = useProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Show loading while identity is initializing or admin check is in progress
  if (isInitializing || (isAuthenticated && adminCheckLoading)) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </main>
    );
  }

  // Auth guard
  if (!isAuthenticated) {
    return <AccessDenied reason="unauthenticated" />;
  }

  if (isAdmin === false) {
    return <AccessDenied reason="not-admin" />;
  }

  const openAddDialog = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm(productToForm(product));
    setFormError(null);
    if (product.image && product.image.startsWith('data:')) {
      setImagePreview(product.image);
    } else {
      setImagePreview(null);
    }
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

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    setIsUploadingImage(true);
    setFormError(null);

    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
      setForm((prev) => ({ ...prev, image: compressed }));
    } catch {
      setFormError('Failed to process image. Please try a different file.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setForm((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      image: form.image,
    };

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...payload });
      } else {
        await addProduct.mutateAsync(payload);
      }
      setDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setFormError(message);
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
        <div className="mb-10">
          <p className="font-sans text-xs tracking-studio uppercase text-accent mb-2">
            Admin Dashboard
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground tracking-wide">
            Store Management
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Manage your products and store content from one place.
          </p>
        </div>

        {/* ── Products Section ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide">
                Product Management
              </h2>
              <p className="font-sans text-sm text-muted-foreground mt-0.5">
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
                    <TableHead className="font-sans text-xs tracking-studio uppercase text-muted-foreground w-16">
                      Image
                    </TableHead>
                    <TableHead className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
                      Name
                    </TableHead>
                    <TableHead className="font-sans text-xs tracking-studio uppercase text-muted-foreground hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead className="font-sans text-xs tracking-studio uppercase text-muted-foreground hidden sm:table-cell">
                      Price
                    </TableHead>
                    <TableHead className="font-sans text-xs tracking-studio uppercase text-muted-foreground hidden lg:table-cell">
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
                    <TableRow key={product.id.toString()} className="hover:bg-secondary/20">
                      {/* Thumbnail */}
                      <TableCell>
                        <div className="w-10 h-12 rounded overflow-hidden bg-secondary flex items-center justify-center">
                          {product.image && product.image.startsWith('data:') ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-muted-foreground/40" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-sans text-sm text-foreground font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant="secondary"
                          className="font-sans text-xs tracking-studio uppercase"
                        >
                          {CATEGORY_LABELS[product.category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-sans text-sm text-foreground hidden sm:table-cell">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell className="font-sans text-sm text-muted-foreground hidden lg:table-cell">
                        {product.stock.toString()}
                      </TableCell>
                      <TableCell className="font-sans text-xs text-muted-foreground hidden lg:table-cell">
                        {product.sizes.join(', ')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(product)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        <Separator className="my-12" />

        {/* ── Content Management Section ── */}
        <ContentManagement />
      </div>

      {/* ── Add / Edit Product Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-foreground">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
                Product Name *
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
                Category
              </Label>
              <Select
                value={form.category}
                onValueChange={(val) => handleFormChange('category', val)}
              >
                <SelectTrigger className="font-sans text-sm">
                  <SelectValue />
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
                placeholder="Describe the product..."
                className="font-sans text-sm resize-none"
                rows={3}
              />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
                  Price (₹) *
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
                  Stock *
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
                Sizes (comma-separated)
              </Label>
              <Input
                value={form.sizes}
                onChange={(e) => handleFormChange('sizes', e.target.value)}
                placeholder="e.g. S, M, L, XL"
                className="font-sans text-sm"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
                Product Image
              </Label>

              {imagePreview ? (
                <div className="relative w-full aspect-[3/4] max-h-48 rounded overflow-hidden border border-border bg-secondary">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-foreground" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="w-full border border-dashed border-border rounded p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                  <span className="font-sans text-xs">
                    {isUploadingImage ? 'Processing image…' : 'Click to upload image'}
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />
            </div>

            {/* Form Error */}
            {formError && (
              <div className="flex items-center gap-2 p-3 rounded border border-destructive/30 bg-destructive/10 text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="font-sans text-sm">{formError}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="font-sans text-xs tracking-studio uppercase"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={isMutating || isUploadingImage}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans text-xs tracking-studio uppercase gap-2"
            >
              {isMutating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : editingProduct ? (
                'Save Changes'
              ) : (
                'Add Product'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl text-foreground">
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription className="font-sans text-sm text-muted-foreground">
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">{deletingProduct?.name}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans text-xs tracking-studio uppercase">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans text-xs tracking-studio uppercase gap-2"
            >
              {deleteProduct.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
