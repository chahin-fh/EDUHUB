'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const subjects = [
  'Tous',
  'Développement Web',
  'Mobile',
  'Data Science',
  'Design UX/UI',
  'Marketing Digital',
  'Business',
  'Langues',
  'Sciences',
  'Mathématiques',
  'Musique',
  'Photographie',
  'Vidéo',
];

interface SubjectsFilterProps {
  onSubjectSelect: (subject: string) => void;
  onSearch: (query: string) => void;
  className?: string;
}

const SubjectsFilter = ({ 
  onSubjectSelect, 
  onSearch,
  className 
}: SubjectsFilterProps) => {
  const [selectedSubject, setSelectedSubject] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Gestion du défilement horizontal
  useEffect(() => {
    const container = document.querySelector('.subjects-container');
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollLeft > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubjectClick = (subject: string) => {
    setSelectedSubject(subject);
    onSubjectSelect(subject === 'Tous' ? '' : subject);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Barre de recherche */}
      <div className="relative mb-6 max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher un cours, un mentor, une compétence..."
          className="pl-10 pr-10 h-12 text-base"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filtres par sujet */}
      <div className="relative">
        <div 
          className={cn(
            'absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-background to-transparent z-10 pointer-events-none',
            !isScrolled && 'opacity-0'
          )}
        />
        
        <div 
          className="subjects-container flex space-x-2 pb-4 overflow-x-auto scrollbar-hide px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {subjects.map((subject) => (
            <Button
              key={subject}
              variant={selectedSubject === subject ? 'default' : 'outline'}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-2 h-auto',
                selectedSubject === subject 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-muted/50'
              )}
              onClick={() => handleSubjectClick(subject)}
            >
              {subject}
            </Button>
          ))}
        </div>
        
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default SubjectsFilter;
