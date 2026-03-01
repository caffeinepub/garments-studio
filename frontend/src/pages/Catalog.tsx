import { useParams, useNavigate } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '../components/ProductCard';
import { useProductsByCategory } from '../hooks/useQueries';
import { Category } from '../backend';
import { CATEGORY_LABELS, CATEGORY_TO_SLUG, CATEGORY_SLUGS, ALL_CATEGORIES } from '../lib/utils';

export function Catalog() {
  const params = useParams({ from: '/catalog/$category' });
  const navigate = useNavigate();

  const activeCategory: Category =
    CATEGORY_SLUGS[params.category] ?? Category.femaleDresses;

  const { data: products, isLoading, isError } = useProductsByCategory(activeCategory);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Page Header */}
      <div className="bg-secondary border-b border-border py-12 px-4 text-center">
        <p className="font-sans text-[10px] tracking-studio uppercase text-accent mb-2">
          Collections
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-foreground">
          {CATEGORY_LABELS[activeCategory]}
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-border pb-6">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                navigate({ to: '/catalog/$category', params: { category: CATEGORY_TO_SLUG[cat] } })
              }
              className={`font-sans text-xs tracking-studio uppercase px-5 py-2 transition-all duration-200 border ${
                activeCategory === cat
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'bg-transparent text-muted-foreground border-border hover:border-accent hover:text-accent'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-sm" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-muted-foreground mb-2">Something went wrong</p>
            <p className="font-sans text-sm text-muted-foreground">Please try refreshing the page.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && products?.length === 0 && (
          <div className="text-center py-20">
            <div className="font-serif text-5xl text-accent/30 mb-4">✦</div>
            <p className="font-serif text-2xl text-muted-foreground mb-2">No products yet</p>
            <p className="font-sans text-sm text-muted-foreground">
              This collection is being curated. Check back soon.
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !isError && products && products.length > 0 && (
          <>
            <p className="font-sans text-xs text-muted-foreground mb-6">
              {products.length} {products.length === 1 ? 'piece' : 'pieces'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
