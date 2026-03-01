import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ShoppingBag, Loader2, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductById, useAddToCart } from '../hooks/useQueries';
import { CATEGORY_LABELS, formatPrice } from '../lib/utils';

export function ProductDetail() {
  const params = useParams({ from: '/product/$id' });
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const productId = BigInt(params.id);
  const { data: product, isLoading, isError } = useProductById(productId);
  const addToCart = useAddToCart();

  const handleAddToCart = async () => {
    if (!selectedSize || !product) return;
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        size: selectedSize,
        quantity: BigInt(1),
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      // error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-[3/4] w-full rounded-sm" />
          <div className="space-y-4 pt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-16" />)}
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center py-32 animate-fade-in">
        <p className="font-serif text-3xl text-muted-foreground mb-4">Product not found</p>
        <button
          onClick={() => navigate({ to: '/' })}
          className="font-sans text-xs tracking-studio uppercase text-accent hover:underline"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const inStock = product.stock > BigInt(0);

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => navigate({ to: '/catalog/$category', params: { category: 'female-dresses' } })}
          className="flex items-center gap-2 font-sans text-xs tracking-studio uppercase text-muted-foreground hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Catalog
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-[3/4] bg-secondary rounded-sm overflow-hidden shadow-card flex items-center justify-center">
              <div className="text-center p-12">
                <div className="font-serif text-8xl text-accent/20 mb-4">✦</div>
                <p className="font-sans text-xs tracking-studio uppercase text-muted-foreground/40">
                  {product.name}
                </p>
              </div>
            </div>
            {/* Stock badge */}
            <div className={`absolute top-4 left-4 font-sans text-[10px] tracking-studio uppercase px-3 py-1 ${
              inStock
                ? 'bg-accent text-accent-foreground'
                : 'bg-destructive text-destructive-foreground'
            }`}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <p className="font-sans text-[10px] tracking-studio uppercase text-accent mb-3">
              {CATEGORY_LABELS[product.category]}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground leading-tight mb-4">
              {product.name}
            </h1>
            <p className="font-sans text-2xl font-medium text-accent mb-6">
              {formatPrice(product.price)}
            </p>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-8 font-light">
              {product.description}
            </p>

            {/* Size Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="font-sans text-xs tracking-studio uppercase text-foreground">
                  Select Size
                </p>
                {selectedSize && (
                  <p className="font-sans text-xs text-accent">
                    Selected: {selectedSize}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`font-sans text-xs tracking-wide-studio uppercase px-4 py-2.5 border transition-all duration-200 min-w-[52px] ${
                      selectedSize === size
                        ? 'bg-accent text-accent-foreground border-accent'
                        : 'bg-transparent text-foreground border-border hover:border-accent hover:text-accent'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="font-sans text-[10px] text-muted-foreground mt-2">
                  Please select a size to continue
                </p>
              )}
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || addToCart.isPending || !inStock}
              className={`w-full font-sans text-xs tracking-studio uppercase py-4 flex items-center justify-center gap-2 transition-all duration-300 ${
                added
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-accent text-accent-foreground hover:bg-foreground hover:text-background disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {addToCart.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : added ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  {inStock ? 'Add to Bag' : 'Out of Stock'}
                </>
              )}
            </button>

            {/* Stock info */}
            {inStock && (
              <p className="font-sans text-[10px] text-muted-foreground text-center mt-3">
                {Number(product.stock)} items available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
