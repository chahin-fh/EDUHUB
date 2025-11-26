'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function UploadCoursePage() {
  const router = useRouter();
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setErrorMessage('Veuillez sélectionner un fichier PDF');
        setPdfFile(null);
        return;
      }
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrorMessage('La taille du fichier ne doit pas dépasser 50MB');
        setPdfFile(null);
        return;
      }
      setErrorMessage('');
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadStatus('idle');
    setErrorMessage('');

    // Validation
    if (!courseName.trim()) {
      setErrorMessage('Le nom du cours est requis');
      return;
    }

    if (!pdfFile) {
      setErrorMessage('Veuillez sélectionner un fichier PDF');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/connexion');
        return;
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('courseName', courseName);
      formData.append('description', description);
      formData.append('pdf', pdfFile);

      const response = await fetch('http://localhost:5000/api/courses/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du téléchargement du cours');
      }

      setUploadStatus('success');
      setCourseName('');
      setDescription('');
      setPdfFile(null);

      // Reset file input
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Redirect after success
      setTimeout(() => {
        router.push('/cours');
      }, 2000);
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Une erreur est survenue lors du téléchargement'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/cours" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
            ← Retour aux cours
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Télécharger un Cours</CardTitle>
            <CardDescription>
              Partagez vos connaissances en téléchargeant un cours au format PDF
            </CardDescription>
          </CardHeader>

          <CardContent>
            {uploadStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-900">Cours téléchargé avec succès!</h3>
                  <p className="text-sm text-green-700">Vous allez être redirigé vers la page des cours...</p>
                </div>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-900">Erreur du téléchargement</h3>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Name */}
              <div>
                <label htmlFor="course-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du cours *
                </label>
                <Input
                  id="course-name"
                  type="text"
                  placeholder="Ex: Introduction à React"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Donnez un nom descriptif à votre cours
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Décrivez le contenu et les objectifs de votre cours..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  className="w-full min-h-[120px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Facultatif - aide les autres à comprendre le contenu du cours
                </p>
              </div>

              {/* PDF Upload Area */}
              <div>
                <label htmlFor="pdf-upload" className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier PDF *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-full">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {pdfFile ? pdfFile.name : 'Cliquez pour télécharger un PDF'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        ou déposez votre fichier ici (max 50MB)
                      </p>
                    </div>
                  </label>
                </div>

                {pdfFile && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{pdfFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPdfFile(null);
                        const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Changer
                    </button>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Téléchargement en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Télécharger le cours
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/cours')}
                  disabled={loading}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Recommandations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
              <p>Assurez-vous que votre fichier PDF est bien formaté et lisible</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
              <p>Le nom du cours doit être clair et descriptif</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
              <p>Taille maximale du fichier: 50MB</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
              <p>Assurez-vous d'avoir le droit de partager ce contenu</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
