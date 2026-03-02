import { useState, useRef, useEffect } from 'react';
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
  RefreshCw,
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

// Max dimensions for resized image (keeps file size small enough for ICP)
const MAX_IMAGE_WIDTH = 600;
const MAX_IMAGE_HEIGHT = 800;
const IMAGE_QUALITY = 0.75;

// Timeout in ms before we stop waiting and show an error
const ADMIN_CHECK_TIMEOUT_MS = 20000;

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
function AccessDenied({ reason }: { reason: 'unauthenticated' | 'not-admin' | 'error' }) {
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
        <h1 className="font-serif text-2xl text-foreground mb-3">
          {reason === 'error' ? 'Connection Error' : 'Access Restricted'}
        </h1>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6">
          {reason === 'unauthenticated'
            ? 'You must be logged in to access the admin panel. Please log in using the menu.'
            : reason === 'error'
              ? 'Unable to verify admin status. The backend may be unavailable. Please try refreshing the page.'
              : 'Your account does not have admin privileges to access this page.'}
        </p>

        {reason === 'error' && (
          <Button
            onClick={() => window.location.reload()}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans text-xs tracking-widest uppercase gap-2 w-full"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Page
          </Button>
        )}

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

  const {
    isAdmin,
    isLoading: adminCheckLoading,
    isFetched: adminCheckFetched,
    isError: adminCheckError,
    refetch: refetchAdminCheck,
  } = useIsCallerAdmin();

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

  // Timeout state: if loading takes too long, show an error
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // Only start the timeout when authenticated and actively loading
    if (!isAuthenticated || !adminCheckLoading || timedOut) {
      return;
    }
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, ADMIN_CHECK_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isAuthenticated, adminCheckLoading, timedOut]);

  // Reset timeout when the query succeeds or errors
  useEffect(() => {
    if (adminCheckFetched || adminCheckError) {
      setTimedOut(false);
    }
  }, [adminCheckFetched, adminCheckError]);

  // ── Render guards ──────────────────────────────────────────────────────────

  // 1. Wait for identity to initialize
  if (isInitializing) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" />
          <p className="font-sans text-sm text-muted-foreground">Loading…</p>
        </div>
      </main>
    );
  }

  // 2. Auth guard — must be logged in
  if (!isAuthenticated) {
    return <AccessDenied reason="unauthenticated" />;
  }

  // 3. Timed out — show retry screen
  if (timedOut) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-2xl text-foreground">Verification Failed</h1>
          <p className="font-sans text-sm text-muted-foreground leading-relaxed">
            Could not verify your admin status. This may be a temporary network issue.
          </p>
          <Button
            onClick={() => {
              setTimedOut(false);
              refetchAdminCheck();
            }}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans text-xs tracking-widest uppercase gap-2 w-full"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  // 4. Query error — show error screen
  if (adminCheckError && !adminCheckLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-2xl text-foreground">Verification Failed</h1>
          <p className="font-sans text-sm text-muted-foreground leading-relaxed">
            Could not verify your admin status. This may be a temporary network issue.
          </p>
          <Button
            onClick={() => refetchAdminCheck()}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans text-xs tracking-widest uppercase gap-2 w-full"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  // 5. Still loading admin check
  if (adminCheckLoading && !adminCheckFetched) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" />
          <p className="font-sans text-sm text-muted-foreground">Verifying admin access…</p>
        </div>
      </main>
    );
  }

  // 6. Fetched but not admin
  if (adminCheckFetched && !isAdmin) {
    return <AccessDenied reason="not-admin" />;
  }

  // 7. Not yet fetched and not loading — edge case, show loading
  if (!adminCheckFetched && !adminCheckLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" />
          <p className="font-sans text-sm text-muted-foreground">Verifying admin access…</p>
        </div>
      </main>
    );
  }

  // ── Admin dashboard ────────────────────────────────────────────────────────

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
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    const error = validateForm(form);
    if (error) {
      setFormError(error);
      return;
    }

    const sizes = form.sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          name: form.name,
          category: form.category,
          description: form.description,
          price: Number(form.price),
          sizes,
          stock: BigInt(form.stock),
          image: form.image,
        });
      } else {
        await addProduct.mutateAsync({
          name: form.name,
          category: form.category,
          description: form.description,
          price: Number(form.price),
          sizes,
          stock: BigInt(form.stock),
          image: form.image,
        });
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save product.');
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProduct.mutateAsync(deletingProduct.id);
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
    } catch {
      setDeleteDialogOpen(false);
    }
  };

  const isMutating = addProduct.isPending || updateProduct.isPending;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-accent" />
            <h1 className="font-serif text-3xl md:text-4xl text-foreground tracking-wide">
              Admin Panel
            </h1>
          </div>
          <p className="font-sans text-sm text-muted-foreground">
            Manage your store's products and content.
          </p>
        </div>

        {/* Products Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide">
                Products
              </h2>
              <p className="font-sans text-sm text-muted-foreground mt-0.5">
                {products ? `${products.length} product${products.length !== 1 ? 's' : ''}` : ''}
              </p>
            </div>
            <Button
              onClick={openAddDialog}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans text-xs tracking-widest uppercase gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 p-4 rounded border border-destructive/30 bg-destructive/10 text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="font-sans text-sm">Failed to load products. Please refresh.</p>
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-sans text-sm text-muted-foreground mb-4">No products yet.</p>
              <Button
                onClick={openAddDialog}
                variant="outline"
                className="font-sans text-xs tracking-widest uppercase gap-2"
              >
                <Plus className="w-4 h-4" />
                Add First Product
              </Button>
            </div>
          ) : (
            <div className="border border-border rounded overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/40">
                    <TableHead className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                      Product
                    </TableHead>
                    <TableHead className="font-sans text-xs tracking-widest uppercase text-muted-foreground hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead className="font-sans text-xs tracking-widest uppercase text-muted-foreground hidden sm:table-cell">
                      Price
                    </TableHead>
                    <TableHead className="font-sans text-xs tracking-widest uppercase text-muted-foreground hidden sm:table-cell">
                      Stock
                    </TableHead>
                    <TableHead className="font-sans text-xs tracking-widest uppercase text-muted-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id.toString()} className="hover:bg-secondary/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image && product.image.startsWith('data:') ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded border border-border shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded border border-border bg-secondary flex items-center justify-center shrink-0">
                              <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-sans text-sm font-medium text-foreground">
                              {product.name}
                            </p>
                            <p className="font-sans text-xs text-muted-foreground md:hidden">
                              {CATEGORY_LABELS[product.category]}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant="secondary"
                          className="font-sans text-xs tracking-wide"
                        >
                          {CATEGORY_LABELS[product.category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-sans text-sm hidden sm:table-cell">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell className="font-sans text-sm hidden sm:table-cell">
                        {product.stock.toString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
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

        {/* Content Management Section */}
        <ContentManagement />
      </div>

      {/* Add / Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                Product Image
              </Label>
              <div
                className="relative border-2 border-dashed border-border rounded-lg overflow-hidden cursor-pointer hover:border-accent/50 transition-colors"
                style={{ minHeight: '140px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full object-cover"
                      style={{ maxHeight: '200px' }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                        setForm((prev) => ({ ...prev, image: '' }));
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    {isUploadingImage ? (
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    )}
                    <p className="font-sans text-sm text-muted-foreground">
                      {isUploadingImage ? 'Processing image…' : 'Click to upload image'}
                    </p>
                    <p className="font-sans text-xs text-muted-foreground/60 mt-1">
                      JPG, PNG or WebP — will be resized automatically
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                Name *
              </Label>
              <Input
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="Product name"
                className="font-sans text-sm"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                Category
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => handleFormChange('category', v as Category)}
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
              <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Product description"
                className="font-sans text-sm resize-none"
                rows={3}
              />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
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
                <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                  Stock *
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => handleFormChange('stock', e.target.value)}
                  placeholder="0"
                  className="font-sans text-sm"
                />
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                Sizes
              </Label>
              <Input
                value={form.sizes}
                onChange={(e) => handleFormChange('sizes', e.target.value)}
                placeholder="S, M, L, XL"
                className="font-sans text-sm"
              />
              <p className="font-sans text-xs text-muted-foreground">
                Comma-separated list of available sizes.
              </p>
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
              <Button variant="outline" className="font-sans text-xs tracking-widest uppercase">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={isMutating || isUploadingImage}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans text-xs tracking-widest uppercase gap-2"
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="font-sans text-sm text-muted-foreground">
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">{deletingProduct?.name}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans text-xs tracking-widest uppercase">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans text-xs tracking-widest uppercase gap-2"
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
