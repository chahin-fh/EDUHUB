'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, BookOpen, MessageSquare, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Mentor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviews: number;
  subjects: string[];
  location: string;
  rate: string;
  available: boolean;
}

interface MentorGridProps {
  subject?: string;
  search?: string;
}

const MentorGrid = ({ subject = '', search = '' }: MentorGridProps) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        // Simuler une requête API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Données factices pour la démo
        const mockMentors: Mentor[] = [
          {
            id: '1',
            name: 'Jean Dupont',
            title: 'Développeur Full Stack Senior',
            avatar: '/avatars/jean-dupont.jpg',
            rating: 4.9,
            reviews: 128,
            subjects: ['Développement Web', 'React', 'Node.js'],
            location: 'Paris, France',
            rate: '50€/h',
            available: true
          },
          {
            id: '2',
            name: 'Marie Martin',
            title: 'UX/UI Designer',
            avatar: '/avatars/marie-martin.jpg',
            rating: 4.8,
            reviews: 95,
            subjects: ['UI/UX Design', 'Figma', 'Prototypage'],
            location: 'Lyon, France',
            rate: '45€/h',
            available: true
          },
          {
            id: '3',
            name: 'Thomas Leroy',
            title: 'Expert en Cybersécurité',
            avatar: '/avatars/thomas-leroy.jpg',
            rating: 5.0,
            reviews: 64,
            subjects: ['Sécurité Informatique', 'Réseaux', 'Ethical Hacking'],
            location: 'Toulouse, France',
            rate: '65€/h',
            available: false
          },
          {
            id: '4',
            name: 'Sophie Bernard',
            title: 'Data Scientist',
            avatar: '/avatars/sophie-bernard.jpg',
            rating: 4.7,
            reviews: 82,
            subjects: ['Machine Learning', 'Python', 'Data Analysis'],
            location: 'Bordeaux, France',
            rate: '55€/h',
            available: true
          },
          {
            id: '5',
            name: 'Alexandre Petit',
            title: 'Développeur Mobile',
            avatar: '/avatars/alexandre-petit.jpg',
            rating: 4.9,
            reviews: 112,
            subjects: ['React Native', 'iOS', 'Android'],
            location: 'Marseille, France',
            rate: '50€/h',
            available: true
          },
          {
            id: '6',
            name: 'Camille Laurent',
            title: 'Product Manager',
            avatar: '/avatars/camille-laurent.jpg',
            rating: 4.8,
            reviews: 76,
            subjects: ['Product Management', 'Agile', 'Scrum'],
            location: 'Nantes, France',
            rate: '60€/h',
            available: true
          }
        ];

        // Filtrer les mentors en fonction du sujet et de la recherche
        let filteredMentors = [...mockMentors];
        
        if (subject) {
          filteredMentors = filteredMentors.filter(mentor => 
            mentor.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase()))
          );
        }
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredMentors = filteredMentors.filter(mentor => 
            mentor.name.toLowerCase().includes(searchLower) ||
            mentor.title.toLowerCase().includes(searchLower) ||
            mentor.subjects.some(s => s.toLowerCase().includes(searchLower))
          );
        }

        setMentors(filteredMentors);
      } catch (err) {
        console.error('Erreur lors du chargement des mentors:', err);
        setError('Impossible de charger les mentors. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [subject, search]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-muted/50 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Aucun mentor trouvé</h3>
        <p className="text-muted-foreground mt-2">
          Aucun mentor ne correspond à votre recherche. Essayez de modifier vos critères.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mentors.map((mentor) => (
        <Card key={mentor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <div className="h-40 bg-muted/50 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-muted/80 flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {mentor.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            {!mentor.available && (
              <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-md">
                Complet
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{mentor.name}</h3>
                <p className="text-sm text-muted-foreground">{mentor.title}</p>
              </div>
              <div className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                <Star className="h-4 w-4 mr-1 fill-current" />
                <span>{mentor.rating}</span>
                <span className="text-muted-foreground text-xs ml-1">({mentor.reviews})</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{mentor.location}</span>
              <span className="mx-2">•</span>
              <span className="font-medium text-foreground">{mentor.rate}</span>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {mentor.subjects.slice(0, 3).map((subject, i) => (
                <span 
                  key={i}
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    'bg-primary/10 text-primary border border-primary/20'
                  )}
                >
                  {subject}
                </span>
              ))}
              {mentor.subjects.length > 3 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{mentor.subjects.length - 3} plus
                </span>
              )}
            </div>
            
            <div className="mt-6 flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                disabled={!mentor.available}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contacter
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
                disabled={!mentor.available}
              >
                <Clock className="h-4 w-4 mr-2" />
                Réserver
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MentorGrid;
