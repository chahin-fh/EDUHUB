// app/cours/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, BookOpen, Clock, Star, Users } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Développement Web Moderne',
    description: 'Apprenez à créer des sites web modernes avec React et Next.js',
    category: 'Développement',
    duration: '12h',
    students: 1245,
    rating: 4.8,
    image: '/images/web-dev.jpg'
  },
  // Ajoutez plus de cours ici
];

export default function CoursPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Nos Cours en Ligne</h1>
        <p className="text-xl text-muted-foreground">
          Découvrez nos formations complètes dans divers domaines
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un cours..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtres
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-muted/50"></div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription className="mt-1">{course.category}</CardDescription>
                </div>
                <span className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  {course.rating} ★
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{course.students} étudiants</span>
                </div>
              </div>
              <Button className="w-full mt-4">Voir le cours</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}