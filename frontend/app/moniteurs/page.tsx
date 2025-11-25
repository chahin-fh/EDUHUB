// app/moniteurs/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Star, GraduationCap, MessageSquare, Users } from 'lucide-react';

const mentors = [
  {
    id: 1,
    name: 'Jean Dupont',
    title: 'Développeur Full Stack',
    experience: '8 ans',
    rating: 4.9,
    students: 1245,
    image: '/images/mentor1.jpg',
    skills: ['React', 'Node.js', 'TypeScript'],
  },
  // Ajoutez plus de moniteurs ici
];

export default function MoniteursPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.skills.some(skill =>
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Nos Moniteurs Expérimentés</h1>
        <p className="text-xl text-muted-foreground">
          Apprenez auprès des meilleurs professionnels du secteur
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un moniteur ou une compétence..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <Card key={mentor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-muted/50 relative">
              <div className="absolute -bottom-8 left-6 h-16 w-16 rounded-full border-4 border-background bg-background overflow-hidden">
                <div className="h-full w-full bg-muted/50"></div>
              </div>
            </div>
            <CardHeader className="pt-12">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{mentor.name}</CardTitle>
                  <p className="text-muted-foreground">{mentor.title}</p>
                </div>
                <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">{mentor.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {mentor.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-muted/50 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>{mentor.experience} d&apos;expérience</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{mentor.students} étudiants</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter
                </Button>
                <Button className="flex-1" size="sm">
                  Voir le profil
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}