'use client';

import { useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Composants dynamiques avec chargement différé
const Navigation = dynamic(() => import('@/components/navigation'), { 
  ssr: false,
  loading: () => null 
});

const HeroSection = dynamic(() => import('@/components/hero-section'), {
  loading: () => <div className="h-[500px] bg-muted/50 animate-pulse"></div>,
});

const SubjectsFilter = dynamic(() => import('@/components/subjects-filter'), {
  loading: () => <div className="h-16 bg-muted/50 rounded-lg animate-pulse"></div>,
});

const MentorGrid = dynamic(() => import('@/components/mentor-grid'), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 bg-muted/50 rounded-lg animate-pulse"></div>
      ))}
    </div>
  ),
});

const AuthSection = dynamic(() => import('@/components/auth-section'), {
  loading: () => <div className="h-[500px] bg-muted/50 animate-pulse my-12"></div>,
});

const ContactSection = dynamic(() => import('@/components/contact-section'), {
  loading: () => <div className="h-[400px] bg-muted/50 animate-pulse my-12"></div>,
});

const Footer = dynamic(() => import('@/components/footer'), {
  loading: () => null,
});

// Composant d'erreur
const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
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
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubjectSelect = useCallback((subject: string) => {
    setSelectedSubject(subject === 'Tous' ? '' : subject);
    // Ici, vous pourriez ajouter la logique de filtrage
  }, []);

  const handleSearch = useCallback((query: string) => {
    try {
      setSearchQuery(query);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error(err);
    }
  }, []);

  const handleRetry = () => {
    setError(null);
    setSelectedSubject('');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      <main className="flex-1">
        <HeroSection />
        
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Trouvez votre mentor</h2>
          <div className="max-w-3xl mx-auto">
            {error && <ErrorMessage message={error} onRetry={handleRetry} />}
            <SubjectsFilter 
              onSubjectSelect={handleSubjectSelect} 
              onSearch={handleSearch} 
            />
            <div className="mt-8">
              <MentorGrid subject={selectedSubject} search={searchQuery} />
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
