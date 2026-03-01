import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { useProducts, useInitializeStore } from '../hooks/useQueries';
import { CATEGORY_LABELS, CATEGORY_IMAGES, CATEGORY_TO_SLUG, ALL_CATEGORIES } from '../lib/utils';

export function Home() {
  const navigate = useNavigate();
  const { data: products } = useProducts();
  const initStore = useInitializeStore();

  // Initialize store if empty
  useEffect(() => {
    if (products && products.length === 0) {
      initStore.mutate();
    }
  }, [products]);

  const categories = ALL_CATEGORIES;

  return (
    <div className="animate-fade-in">
      {/* Cover Hero — 4-photo collage, no text */}
      <section className="w-full overflow-hidden">
        <img
          src="/assets/generated/cover-hero.dim_1800x900.png"
          alt="Dhimayu Studio collection cover"
          className="w-full object-cover object-center block"
          style={{ maxHeight: '90vh', minHeight: '260px' }}
        />
      </section>

      {/* Brand Statement */}
      <section className="py-16 md:py-20 px-4 text-center bg-background">
        <div className="max-w-2xl mx-auto">
          <p className="font-sans text-[10px] tracking-studio uppercase text-accent mb-4">
            Our Philosophy
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground leading-relaxed mb-6">
            "Crafted for the moments that matter"
          </h2>
          <p className="font-sans text-sm text-muted-foreground leading-relaxed font-light">
            From flowing dresses to crisp shirts and playful kids' wear — every piece in our studio
            is selected for its quality, comfort, and enduring style.
          </p>
          <button
            onClick={() => navigate({ to: '/catalog/$category', params: { category: 'female-dresses' } })}
            className="group mt-8 font-sans text-xs tracking-studio uppercase bg-accent text-accent-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-all duration-300 inline-flex items-center gap-2"
          >
            Explore Collections
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-12 md:py-16 px-4 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-sans text-[10px] tracking-studio uppercase text-accent mb-2">
              Shop by Category
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">
              Featured Collections
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => navigate({ to: '/catalog/$category', params: { category: CATEGORY_TO_SLUG[cat] } })}
                className="group relative overflow-hidden rounded-sm shadow-card hover:shadow-card-hover transition-all duration-300 text-left"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={CATEGORY_IMAGES[cat]}
                    alt={CATEGORY_LABELS[cat]}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <h3 className="font-serif text-xl md:text-2xl text-foreground leading-tight mb-1">
                      {CATEGORY_LABELS[cat]}
                    </h3>
                    <span className="font-sans text-[10px] tracking-studio uppercase text-accent flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                      Shop Now <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="py-12 px-4 bg-background border-t border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { title: 'Curated Quality', desc: 'Every piece hand-selected for craftsmanship and style.' },
            { title: 'Thoughtful Sizing', desc: 'Inclusive size ranges across all our collections.' },
            { title: 'Studio Promise', desc: 'Timeless designs that transcend seasonal trends.' },
          ].map((f) => (
            <div key={f.title} className="px-4">
              <div className="font-serif text-2xl text-accent mb-3">✦</div>
              <h3 className="font-serif text-lg text-foreground mb-2">{f.title}</h3>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
