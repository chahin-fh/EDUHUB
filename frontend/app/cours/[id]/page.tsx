'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Download,
  Calendar,
  FileText,
  User,
  Mail,
  Loader2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

interface Course {
  _id: string;
  courseName: string;
  description: string;
  uploadedBy?: {
    _id: string;
    username: string;
    email: string;
  };
  uploader?: {
    username: string;
    email: string;
  };
  pdfFile?: {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
  };
  createdAt?: string;
  updatedAt?: string;
  status?: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`);

        if (!response.ok) {
          throw new Error('Cours non trouvé');
        }

        const data = await response.json();
        setCourse(data.course);
        setError('');
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(
          err instanceof Error ? err.message : 'Erreur lors du chargement du cours'
        );
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      window.open(`http://localhost:5000/api/courses/${courseId}/download`, '_blank');
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/cours" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour aux cours
          </Link>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">{error || 'Cours non trouvé'}</h3>
              <p className="text-sm text-red-700 mb-4">
                Le cours que vous recherchez n'existe pas ou a été supprimé.
              </p>
              <Link href="/cours">
                <Button variant="outline">Retourner aux cours</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const uploader = course.uploadedBy || course.uploader;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/cours" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour aux cours
        </Link>

        {/* Header Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700"></div>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{course.courseName}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Créé par <span className="font-semibold">{uploader?.username || 'Utilisateur'}</span></span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-4">
                  {formatDate(course.createdAt)}
                </div>
                {course.status && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {course.status === 'active' ? 'Actif' : 'En attente'}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Description */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Description du cours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {course.description || 'Aucune description disponible pour ce cours.'}
                </p>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Informations du cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 pb-4 border-b">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Fichier PDF</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {course.pdfFile?.originalName || 'Fichier PDF'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Taille: {formatFileSize(course.pdfFile?.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pb-4 border-b">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Date de création</p>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(course.createdAt)}</p>
                    </div>
                  </div>

                  {course.updatedAt && course.updatedAt !== course.createdAt && (
                    <div className="flex items-start gap-4">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Dernière modification</p>
                        <p className="text-sm text-gray-900 mt-1">{formatDate(course.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Uploader Info Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Créateur du cours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{uploader?.username || 'Utilisateur'}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {uploader?.email || 'email@example.com'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Télécharger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full gap-2"
                  size="lg"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Télécharger le PDF
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  {formatFileSize(course.pdfFile?.size)}
                </p>
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Partager</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Lien copié dans le presse-papiers!');
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  Copier le lien
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
