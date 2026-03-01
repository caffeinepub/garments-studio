import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { type Product } from '../backend';
import { formatPrice } from '../lib/utils';
import { useAddToCart } from '../hooks/useQueries';

interface ProductCardProps {
  product: Product;
}

function isDataUri(value: string): boolean {
  return value.startsWith('data:image/');
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAddToCart();
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hasImage = product.image && isDataUri(product.image) && !imgError;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.sizes.length === 0) return;
    setAdding(true);
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        size: product.sizes[0],
        quantity: BigInt(1),
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id.toString() }}
      className="group block"
    >
      <div className="relative overflow-hidden bg-secondary rounded-sm shadow-card hover:shadow-card-hover transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {hasImage ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <div className="text-center p-6">
                <div className="font-serif text-4xl text-accent/40 mb-2">✦</div>
                <p className="font-sans text-xs tracking-studio uppercase text-muted-foreground/50">
                  {product.name.charAt(0)}
                </p>
              </div>
            </div>
          )}
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-all duration-300" />
          {/* Quick add button */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleQuickAdd}
              disabled={adding || product.stock === BigInt(0)}
              className="w-full bg-accent text-accent-foreground font-sans text-xs tracking-studio uppercase py-3 flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <ShoppingBag className="w-3 h-3" />
              )}
              {product.stock === BigInt(0) ? 'Out of Stock' : 'Quick Add'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="font-sans text-[10px] tracking-studio uppercase text-muted-foreground mb-1">
            {product.sizes.slice(0, 4).join(' · ')}
            {product.sizes.length > 4 && ' · +more'}
          </p>
          <h3 className="font-serif text-lg text-foreground group-hover:text-accent transition-colors duration-200 leading-tight mb-1">
            {product.name}
          </h3>
          <p className="font-sans text-sm font-medium text-accent">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}
