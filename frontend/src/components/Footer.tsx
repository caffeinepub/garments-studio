import { Heart } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'dhimayu-studio');

  return (
    <footer className="border-t border-border bg-secondary mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <img
              src="/assets/generated/dhimayu-logo-black.dim_400x400.png"
              alt="DHIMAYU STUDIO"
              className="h-16 w-auto object-contain mb-4"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const sibling = target.nextElementSibling as HTMLElement | null;
                if (sibling) sibling.style.removeProperty('display');
              }}
            />
            <h3
              className="font-serif text-xl tracking-studio mb-4 text-foreground"
              style={{ display: 'none' }}
            >
              DHIMAYU STUDIO
            </h3>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              Curated fashion for every occasion. Timeless pieces crafted with care.
            </p>
          </div>
          <div>
            <h4 className="font-sans text-xs tracking-studio uppercase text-accent mb-4">Collections</h4>
            <ul className="space-y-2">
              {['Female Dresses', 'Male Shirts', 'Male T-Shirts', 'Kids Apparel'].map((item) => (
                <li key={item}>
                  <span className="font-sans text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-xs tracking-studio uppercase text-accent mb-4">Studio</h4>
            <ul className="space-y-2">
              {['About Us', 'Sustainability', 'Size Guide', 'Contact'].map((item) => (
                <li key={item}>
                  <span className="font-sans text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-muted-foreground">
            © {year} DHIMAYU STUDIO. All rights reserved.
          </p>
          <p className="font-sans text-xs text-muted-foreground flex items-center gap-1">
            Built with{' '}
            <Heart className="w-3 h-3 fill-accent text-accent" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
