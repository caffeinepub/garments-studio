import { useSearch, Link } from '@tanstack/react-router';
import { CheckCircle, ArrowRight } from 'lucide-react';

export function OrderConfirmation() {
  const search = useSearch({ from: '/order-confirmation' });
  const orderId = (search as { orderId?: string }).orderId;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 animate-fade-in">
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mb-8">
        <CheckCircle className="w-10 h-10 text-accent" />
      </div>

      <p className="font-sans text-[10px] tracking-studio uppercase text-accent mb-3">
        Order Confirmed
      </p>
      <h1 className="font-serif text-4xl md:text-5xl text-foreground text-center mb-4">
        Thank You
      </h1>
      <p className="font-sans text-sm text-muted-foreground text-center max-w-md mb-6 font-light leading-relaxed">
        Your order has been placed successfully. We'll be in touch with shipping details soon.
      </p>

      {orderId && (
        <div className="bg-secondary border border-border px-6 py-4 rounded-sm mb-8 text-center">
          <p className="font-sans text-[10px] tracking-studio uppercase text-muted-foreground mb-1">
            Order Reference
          </p>
          <p className="font-serif text-2xl text-accent">#{orderId}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="font-sans text-xs tracking-studio uppercase text-muted-foreground border border-border px-8 py-3 hover:border-accent hover:text-accent transition-colors duration-200 text-center"
        >
          Return Home
        </Link>
        <Link
          to="/catalog/$category"
          params={{ category: 'female-dresses' }}
          className="font-sans text-xs tracking-studio uppercase bg-accent text-accent-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-colors duration-200 flex items-center justify-center gap-2"
        >
          Continue Shopping
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
