import { useNavigate, Link } from '@tanstack/react-router';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useCart, useRemoveFromCart, useAddToCart, useProducts } from '../hooks/useQueries';
import { formatPrice } from '../lib/utils';
import { type CartItem, type Product } from '../backend';

function CartItemRow({
  item,
  product,
}: {
  item: CartItem;
  product: Product | undefined;
}) {
  const removeFromCart = useRemoveFromCart();
  const addToCart = useAddToCart();

  const handleDecrement = async () => {
    if (Number(item.quantity) <= 1) {
      await removeFromCart.mutateAsync({ productId: item.productId, size: item.size });
    } else {
      await addToCart.mutateAsync({
        productId: item.productId,
        size: item.size,
        quantity: BigInt(Number(item.quantity) - 1),
      });
    }
  };

  const handleIncrement = async () => {
    await addToCart.mutateAsync({
      productId: item.productId,
      size: item.size,
      quantity: BigInt(Number(item.quantity) + 1),
    });
  };

  const handleRemove = async () => {
    await removeFromCart.mutateAsync({ productId: item.productId, size: item.size });
  };

  const isMutating = removeFromCart.isPending || addToCart.isPending;
  const lineTotal = product ? product.price * Number(item.quantity) : 0;

  return (
    <div className="flex gap-4 py-6 border-b border-border last:border-0">
      {/* Product image placeholder */}
      <div className="w-20 h-24 md:w-24 md:h-28 bg-secondary rounded-sm flex-shrink-0 flex items-center justify-center">
        <span className="font-serif text-2xl text-accent/40">✦</span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg text-foreground leading-tight">
              {product?.name ?? `Product #${item.productId.toString()}`}
            </h3>
            <p className="font-sans text-xs tracking-studio uppercase text-muted-foreground mt-1">
              Size: {item.size}
            </p>
          </div>
          <button
            onClick={handleRemove}
            disabled={isMutating}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 flex-shrink-0"
            aria-label="Remove item"
          >
            {removeFromCart.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          {/* Quantity controls */}
          <div className="flex items-center border border-border">
            <button
              onClick={handleDecrement}
              disabled={isMutating}
              className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted hover:text-accent transition-colors disabled:opacity-40"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-10 text-center font-sans text-sm text-foreground">
              {isMutating ? (
                <Loader2 className="w-3 h-3 animate-spin mx-auto" />
              ) : (
                Number(item.quantity)
              )}
            </span>
            <button
              onClick={handleIncrement}
              disabled={isMutating}
              className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted hover:text-accent transition-colors disabled:opacity-40"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Line total */}
          <p className="font-sans text-sm font-medium text-accent">
            {product ? formatPrice(lineTotal) : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Cart() {
  const navigate = useNavigate();
  const { data: cartItems, isLoading } = useCart();
  const { data: allProducts } = useProducts();

  const getProduct = (productId: bigint): Product | undefined =>
    allProducts?.find((p) => p.id === productId);

  const subtotal =
    cartItems?.reduce((sum, item) => {
      const product = getProduct(item.productId);
      return sum + (product ? product.price * Number(item.quantity) : 0);
    }, 0) ?? 0;

  const totalItems = cartItems?.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
        <Skeleton className="h-10 w-40 mb-8" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 py-6 border-b border-border">
            <Skeleton className="w-24 h-28 rounded-sm" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 animate-fade-in">
        <ShoppingBag className="w-12 h-12 text-accent/30 mb-6" />
        <h2 className="font-serif text-3xl text-foreground mb-3">Your bag is empty</h2>
        <p className="font-sans text-sm text-muted-foreground mb-8">
          Discover our curated collections and find something you love.
        </p>
        <Link
          to="/catalog/$category"
          params={{ category: 'female-dresses' }}
          className="font-sans text-xs tracking-studio uppercase bg-accent text-accent-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-colors duration-200"
        >
          Shop Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-secondary border-b border-border py-10 px-4 text-center">
        <h1 className="font-serif text-4xl text-foreground">Shopping Bag</h1>
        <p className="font-sans text-xs text-muted-foreground mt-2">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sans text-xs tracking-studio uppercase text-muted-foreground">
                Items
              </h2>
              <Link
                to="/catalog/$category"
                params={{ category: 'female-dresses' }}
                className="font-sans text-xs tracking-studio uppercase text-muted-foreground hover:text-accent transition-colors"
              >
                Continue Shopping
              </Link>
            </div>

            <div>
              {cartItems.map((item) => (
                <CartItemRow
                  key={`${item.productId}-${item.size}`}
                  item={item}
                  product={getProduct(item.productId)}
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-secondary p-6 rounded-sm sticky top-24 border border-border">
              <h2 className="font-serif text-xl text-foreground mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {cartItems.map((item) => {
                  const product = getProduct(item.productId);
                  return (
                    <div key={`${item.productId}-${item.size}`} className="flex justify-between">
                      <span className="font-sans text-xs text-muted-foreground">
                        {product?.name ?? 'Item'} × {Number(item.quantity)}
                      </span>
                      <span className="font-sans text-xs text-foreground">
                        {product ? formatPrice(product.price * Number(item.quantity)) : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Separator className="mb-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-sans text-sm tracking-wide-studio uppercase text-foreground">
                  Subtotal
                </span>
                <span className="font-serif text-xl text-accent">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <p className="font-sans text-[10px] text-muted-foreground mb-6 text-center">
                Shipping and taxes calculated at checkout
              </p>

              <button
                onClick={() => navigate({ to: '/checkout' })}
                className="w-full font-sans text-xs tracking-studio uppercase bg-accent text-accent-foreground py-4 flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-colors duration-200"
              >
                Proceed to Checkout
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
