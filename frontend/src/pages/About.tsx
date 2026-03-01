import { useGetStoreContent } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

export function About() {
  const { data: storeContent, isLoading } = useGetStoreContent();

  // Split about page copy into paragraphs by newlines
  const paragraphs = storeContent?.aboutPageCopy
    ? storeContent.aboutPageCopy
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean)
    : null;

  // Fallback static paragraphs
  const fallbackParagraphs = [
    'For over a decade, Dhimayu has been crafting Graphic designed unisex T-shirts with genuine love and thoughtful care. Every design that leaves our house is exclusive — born from the creative minds of our very own designers.',
    'In the last two years, we expanded our world to dress everyone at the table — men, women, and little ones too. Whether you\'re shopping for yourself or building a wardrobe for the whole family, Dhimayu is where you belong.',
    'We believe the best families are dressed together. That\'s why we created collections made for you — as individuals, and as one.',
    'At the heart of it all is a simple promise: pure cotton and linen, season after season, year-round comfort that fits the way you live.',
  ];

  const displayParagraphs = paragraphs && paragraphs.length > 0 ? paragraphs : fallbackParagraphs;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero banner */}
      <section className="bg-secondary border-b border-border py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-sans text-xs tracking-studio uppercase text-accent mb-4">Our Story</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-wide text-foreground">
            About Us
          </h1>
          <div className="mt-6 w-12 h-px bg-accent mx-auto" />
        </div>
      </section>

      {/* Content */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-full rounded" />
                <Skeleton className="h-5 w-5/6 rounded" />
                <Skeleton className="h-5 w-4/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {displayParagraphs.map((para, idx) => (
              <p
                key={idx}
                className="font-sans text-base md:text-lg text-foreground/80 leading-relaxed"
              >
                {para}
              </p>
            ))}

            <div className="pt-6 border-t border-border">
              <p className="font-serif text-xl md:text-2xl text-accent tracking-wide italic">
                Dhimayu — Dressed with Love, Worn with Pride.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
