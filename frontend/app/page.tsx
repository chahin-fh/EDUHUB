"use client";

import { useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";

const HeroSection = dynamic(() => import("@/components/hero-section"), {
  loading: () => <div className="h-[500px] bg-muted/50 animate-pulse"></div>,
});

const MentorGrid = dynamic(() => import("@/components/mentor-grid"), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-64 bg-muted/50 rounded-lg animate-pulse"
        ></div>
      ))}
    </div>
  ),
});

const AuthSection = dynamic(() => import("@/components/auth-section"), {
  loading: () => (
    <div className="h-[500px] bg-muted/50 animate-pulse my-12"></div>
  ),
});

const ContactSection = dynamic(() => import("@/components/contact-section"), {
  loading: () => (
    <div className="h-[400px] bg-muted/50 animate-pulse my-12"></div>
  ),
});

const Footer = dynamic(() => import("@/components/footer"), {
  loading: () => null,
});

// Composant d'erreur
const ErrorMessage = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="p-4 bg-red-50 text-red-700 rounded-lg my-4">
    <h2 className="font-bold text-lg mb-2">Une erreur est survenue</h2>
    <p className="mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
    >
      Réessayer
    </button>
  </div>
);

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback((query: string) => {
    try {
      setSearchQuery(query);
      setError(null);
    } catch (err) {
      setError("Erreur lors de la recherche");
      console.error(err);
    }
  }, []);

  const handleRetry = () => {
    setError(null);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex-1">
        <HeroSection />

        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8">
              Trouvez votre mentor
            </h2>

            {/* Barre de recherche intégrée */}
            <div className="mb-8">
              <div className="relative max-w-2xl mx-auto">
                <div className="flex items-center bg-background border border-border rounded-full px-6 py-4 focus-within:border-primary transition">
                  <svg
                    className="w-5 h-5 text-muted-foreground mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Rechercher un mentor par nom, profession..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 bg-transparent outline-none placeholder-muted-foreground text-lg"
                  />
                </div>
              </div>
            </div>

            {error && <ErrorMessage message={error} onRetry={handleRetry} />}

            {/* Affichage de tous les utilisateurs avec résultats de recherche */}
            <div className="mt-8">
              <MentorGrid subject="" search={searchQuery} />
            </div>
          </div>
        </section>

        <AuthSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
