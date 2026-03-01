import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../hooks/useQueries';
import { CATEGORY_LABELS, CATEGORY_TO_SLUG, ALL_CATEGORIES } from '../lib/utils';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { data: cartItems } = useCart();

  const cartCount = cartItems?.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 md:h-20">

          {/* Desktop Nav — left side */}
          <nav className="hidden md:flex items-center gap-6 z-10">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => navigate({ to: '/catalog/$category', params: { category: CATEGORY_TO_SLUG[cat] } })}
                className="font-sans text-xs tracking-studio uppercase text-muted-foreground hover:text-accent transition-colors duration-200"
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
            <Link
              to="/admin"
              className="font-sans text-xs tracking-studio uppercase text-muted-foreground hover:text-accent transition-colors duration-200"
            >
              Admin
            </Link>
          </nav>

          {/* Centered Logo + Brand Name */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 z-10"
          >
            <img
              src="/assets/generated/dhimayu-logo.dim_400x400.png"
              alt="DHIMAYU STUDIO"
              className="h-10 md:h-13 w-auto object-contain"
              style={{ mixBlendMode: 'darken' }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="font-serif text-base md:text-xl tracking-studio uppercase text-white drop-shadow-sm whitespace-nowrap">
              DHIMAYU STUDIO
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-4 z-10 ml-auto">
            <Link to="/cart" className="relative p-2 text-foreground hover:text-accent transition-colors duration-200">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-sans w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-foreground hover:text-accent transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  navigate({ to: '/catalog/$category', params: { category: CATEGORY_TO_SLUG[cat] } });
                  setMobileOpen(false);
                }}
                className="text-left font-sans text-xs tracking-studio uppercase text-muted-foreground hover:text-accent py-3 border-b border-border transition-colors"
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="text-left font-sans text-xs tracking-studio uppercase text-muted-foreground hover:text-accent py-3 transition-colors"
            >
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
