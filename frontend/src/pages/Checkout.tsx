import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { ArrowLeft, Loader2, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCart, usePlaceOrder, useClearCart, useProducts } from '../hooks/useQueries';
import { formatPrice } from '../lib/utils';
import { type Product } from '../backend';

export function Checkout() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<{ name?: string; address?: string }>({});

  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { data: allProducts } = useProducts();
  const placeOrder = usePlaceOrder();
  const clearCart = useClearCart();

  const getProduct = (productId: bigint): Product | undefined =>
    allProducts?.find((p) => p.id === productId);

  const subtotal =
    cartItems?.reduce((sum, item) => {
      const product = getProduct(item.productId);
      return sum + (product ? product.price * Number(item.quantity) : 0);
    }, 0) ?? 0;

  const validate = () => {
    const newErrors: { name?: string; address?: string } = {};
    if (!customerName.trim()) newErrors.name = 'Name is required';
    if (!address.trim()) newErrors.address = 'Delivery address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate() || !cartItems || cartItems.length === 0) return;
    try {
      const orderId = await placeOrder.mutateAsync({
        cartItems,
        totalAmount: subtotal,
      });
      await clearCart.mutateAsync();
      navigate({ to: '/order-confirmation', search: { orderId: orderId.toString() } });
    } catch {
      // error handled by mutation
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 animate-fade-in">
        <ShoppingBag className="w-12 h-12 text-accent/30 mb-6" />
        <h2 className="font-serif text-3xl text-foreground mb-3">Your bag is empty</h2>
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
        <h1 className="font-serif text-4xl text-foreground">Checkout</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 font-sans text-xs tracking-studio uppercase text-muted-foreground hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Bag
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Customer Form */}
          <div>
            <h2 className="font-serif text-2xl text-foreground mb-6">Delivery Details</h2>

            <div className="space-y-5">
              <div>
                <Label className="font-sans text-xs tracking-studio uppercase text-foreground mb-2 block">
                  Full Name *
                </Label>
                <Input
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Your full name"
                  className={`font-sans text-sm bg-muted border-border focus:border-accent rounded-sm ${
                    errors.name ? 'border-destructive' : ''
                  }`}
                />
                {errors.name && (
                  <p className="font-sans text-xs text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label className="font-sans text-xs tracking-studio uppercase text-foreground mb-2 block">
                  Delivery Address *
                </Label>
                <Textarea
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                  }}
                  placeholder="Street address, city, postal code, country"
                  rows={4}
                  className={`font-sans text-sm bg-muted border-border focus:border-accent rounded-sm resize-none ${
                    errors.address ? 'border-destructive' : ''
                  }`}
                />
                {errors.address && (
                  <p className="font-sans text-xs text-destructive mt-1">{errors.address}</p>
                )}
              </div>
            </div>

            {placeOrder.isError && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-sm">
                <p className="font-sans text-xs text-destructive">
                  Failed to place order. Please try again.
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="font-serif text-2xl text-foreground mb-6">Order Summary</h2>

            <div className="bg-secondary p-6 rounded-sm border border-border">
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  const product = getProduct(item.productId);
                  return (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm text-foreground truncate">
                          {product?.name ?? `Product #${item.productId.toString()}`}
                        </p>
                        <p className="font-sans text-[10px] tracking-studio uppercase text-muted-foreground">
                          Size: {item.size} · Qty: {Number(item.quantity)}
                        </p>
                      </div>
                      <p className="font-sans text-sm text-foreground flex-shrink-0">
                        {product ? formatPrice(product.price * Number(item.quantity)) : '—'}
                      </p>
                    </div>
                  );
                })}
              </div>

              <Separator className="mb-4" />

              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-xs text-muted-foreground">Subtotal</span>
                <span className="font-sans text-sm text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-sans text-xs text-muted-foreground">Shipping</span>
                <span className="font-sans text-xs text-muted-foreground">Calculated later</span>
              </div>

              <Separator className="mb-4" />

              <div className="flex justify-between items-center mb-8">
                <span className="font-sans text-sm tracking-wide-studio uppercase text-foreground">
                  Total
                </span>
                <span className="font-serif text-2xl text-accent">{formatPrice(subtotal)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placeOrder.isPending || clearCart.isPending}
                className="w-full font-sans text-xs tracking-studio uppercase bg-accent text-accent-foreground py-4 flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placeOrder.isPending || clearCart.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
