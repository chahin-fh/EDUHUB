// app/cours/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, BookOpen, Clock, Star, Users, Loader2, Download, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Course {
  _id: string;
  courseName: string;
  description: string;
  uploadedBy?: {
    username: string;
    email: string;
  };
  uploader?: {
    username: string;
    email: string;
  };
  pdfFile?: {
    size: number;
  };
  createdAt?: string;
}

export default function CoursePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/courses');
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        setCourses(data.courses || []);
        setError('');
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Erreur lors du chargement des cours');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-900">{error}</h3>
            <p className="text-sm text-red-700">Veuillez réessayer plus tard.</p>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours trouvé</h3>
          <p className="text-gray-600">
            {courses.length === 0 
              ? 'Aucun cours n\'a été téléchargé pour le moment.' 
              : 'Aucun cours ne correspond à votre recherche.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const uploader = course.uploadedBy || course.uploader;
            return (
              <Link key={course._id} href={`/cours/${course._id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full cursor-pointer hover:scale-105 transform duration-200">
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">{course.courseName}</CardTitle>
                        <CardDescription className="mt-1">
                          Par {uploader?.username || 'Utilisateur'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                      {course.description || 'Aucune description disponible'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 mt-auto pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(course.createdAt)}</span>
                      </div>
                      {course.pdfFile && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{formatFileSize(course.pdfFile.size)}</span>
                        </div>
                      )}
                    </div>

                    <Button variant="outline" className="w-full gap-2">
                      Voir les détails
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}