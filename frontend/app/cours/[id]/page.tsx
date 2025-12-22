"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import Link from "next/link";

interface Course {
  _id: string;
  courseName: string;
  title?: string;
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
  documentFile?: {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
  };
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  category?: string;
  level?: string;
  language?: string;
  price?: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/courses/${courseId}`
        );

        if (!response.ok) {
          throw new Error("Cours non trouvé");
        }

        const data = await response.json();
        setCourse(data.course);
        setError("");
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement du cours"
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
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date inconnue";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      window.open(
        `http://localhost:5000/api/courses/${courseId}/download`,
        "_blank"
      );
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement du cours...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/cours"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux cours
          </Link>

          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {error || "Cours non trouvé"}
              </h3>
              <p className="text-gray-600 mb-8">
                Le cours que vous recherchez n&apos;existe pas ou a été
                supprimé.
              </p>
              <Link href="/cours">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Retourner aux cours
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const uploader = course.uploadedBy || course.uploader;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/cours"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux cours
        </Link>

        {/* Hero Header */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  {course.status && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.status === "published"
                          ? "bg-green-100 text-green-800"
                          : course.status === "draft"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {course.status === "published"
                        ? "Publié"
                        : course.status === "draft"
                        ? "Brouillon"
                        : "En attente"}
                    </span>
                  )}
                  {course.category && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {course.category}
                    </span>
                  )}
                  {course.level && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {course.level}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {course.title || course.courseName}
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      Créé par{" "}
                      <span className="font-semibold">
                        {uploader?.username || "Utilisateur"}
                      </span>
                    </span>
                  </div>
                  {course.price !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-600">
                        {course.price === 0 ? "Gratuit" : `${course.price} TND`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-2">
                  {formatDate(course.createdAt)}
                </div>
                {course.language && (
                  <div className="text-sm text-gray-600">
                    Langue:{" "}
                    {course.language === "fr" ? "Français" : course.language}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Description */}
          <div className="lg:col-span-2">
            {/* Description Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Description du cours
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {course.description ||
                    "Aucune description disponible pour ce cours."}
                </p>
              </div>
            </div>

            {/* Course Info Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Informations du cours
              </h2>
              <div className="space-y-6">
                {/* Document Info */}
                {(course.documentFile || course.pdfFile) && (
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Document du cours
                      </h3>
                      <p className="text-sm text-gray-900 mb-1">
                        {course.documentFile?.originalName ||
                          course.pdfFile?.originalName ||
                          "Document"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Taille:{" "}
                        {formatFileSize(
                          course.documentFile?.size || course.pdfFile?.size
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Type:{" "}
                        {(
                          course.documentFile?.mimetype ||
                          course.pdfFile?.mimetype
                        )
                          ?.split("/")[1]
                          ?.toUpperCase() || "Document"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Creation Date */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Calendar className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Date de création
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(course.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Last Modified */}
                {course.updatedAt && course.updatedAt !== course.createdAt && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <Calendar className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Dernière modification
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(course.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Uploader Info Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Créateur du cours
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-lg">
                    {uploader?.username || "Utilisateur"}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {uploader?.email || "email@example.com"}
                  </p>
                </div>
              </div>
            </div>

            {/* Download Card */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 shadow-lg text-white">
              <h3 className="text-xl font-bold mb-6">Télécharger le cours</h3>
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                size="lg"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Téléchargement en cours...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Télécharger le document
                  </>
                )}
              </Button>
              {(course.documentFile || course.pdfFile) && (
                <p className="text-sm text-white/80 text-center mt-4">
                  {formatFileSize(
                    course.documentFile?.size || course.pdfFile?.size
                  )}
                </p>
              )}
            </div>

            {/* Share Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Partager ce cours
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full gap-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // Créer une notification temporaire
                    const notification = document.createElement("div");
                    notification.className =
                      "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
                    notification.textContent =
                      "Lien copié dans le presse-papiers!";
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  Copier le lien
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Partagez ce cours avec vos amis et collègues
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            {(course.category || course.level) && (
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Détails du cours
                </h3>
                <div className="space-y-4">
                  {course.category && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Catégorie</span>
                      <span className="text-sm font-semibold text-gray-900 bg-blue-100 px-3 py-1 rounded-full">
                        {course.category}
                      </span>
                    </div>
                  )}
                  {course.level && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Niveau</span>
                      <span className="text-sm font-semibold text-gray-900 bg-purple-100 px-3 py-1 rounded-full">
                        {course.level}
                      </span>
                    </div>
                  )}
                  {course.price !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prix</span>
                      <span
                        className={`text-sm font-bold ${
                          course.price === 0
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {course.price === 0 ? "Gratuit" : `${course.price} TND`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
