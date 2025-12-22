// app/cours/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Star,
  Users,
  Loader2,
  Download,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Course {
  _id: string;
  courseName: string;
  title?: string;
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
  documentFile?: {
    size: number;
    mimetype: string;
    originalName: string;
  };
  createdAt?: string;
  status?: string;
  category?: string;
  level?: string;
  price?: number;
}

export default function CoursePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/courses");

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data.courses || []);
        setError("");
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Erreur lors du chargement des cours");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    });
  };

  const getFileTypeDisplay = (mimetype?: string, isPdfFile?: boolean) => {
    if (isPdfFile) return { name: "PDF", color: "bg-red-100 text-red-600" };

    if (!mimetype)
      return { name: "Document", color: "bg-gray-100 text-gray-600" };

    const mimeTypes: { [key: string]: { name: string; color: string } } = {
      "application/pdf": { name: "PDF", color: "bg-red-100 text-red-600" },
      "application/vnd.ms-powerpoint": {
        name: "PPT",
        color: "bg-orange-100 text-orange-600",
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        {
          name: "PPTX",
          color: "bg-orange-100 text-orange-600",
        },
      "application/msword": { name: "DOC", color: "bg-blue-100 text-blue-600" },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        {
          name: "DOCX",
          color: "bg-blue-100 text-blue-600",
        },
      "application/vnd.ms-excel": {
        name: "XLS",
        color: "bg-green-100 text-green-600",
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
        name: "XLSX",
        color: "bg-green-100 text-green-600",
      },
      "application/vnd.ms-access": {
        name: "MDB",
        color: "bg-purple-100 text-purple-600",
      },
      "application/x-msaccess": {
        name: "MDB",
        color: "bg-purple-100 text-purple-600",
      },
      "application/vnd.ms-access.accdb": {
        name: "ACCDB",
        color: "bg-purple-100 text-purple-600",
      },
    };

    return (
      mimeTypes[mimetype] || {
        name: mimetype.split("/")[1]?.toUpperCase() || "Document",
        color: "bg-gray-100 text-gray-600",
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Découvrez Nos Cours
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explorez notre collection de formations complètes dans divers
              domaines. Apprenez à votre rythme avec des documents de qualité.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher un cours..."
                className="pl-12 h-14 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="h-14 px-8 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filtres
            </Button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Chargement des cours...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{error}</h3>
              <p className="text-gray-600 mb-8">
                Une erreur est survenue lors du chargement des cours. Veuillez
                réessayer plus tard.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Réessayer
              </Button>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {courses.length === 0
                ? "Aucun cours disponible"
                : "Aucun cours trouvé"}
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              {courses.length === 0
                ? "Aucun cours n'a été téléchargé pour le moment. Revenez plus tard !"
                : "Aucun cours ne correspond à votre recherche. Essayez avec d autres termes."}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              >
                Effacer la recherche
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const uploader = course.uploadedBy || course.uploader;
              const fileData = course.documentFile || course.pdfFile;
              const fileType = getFileTypeDisplay(
                course.documentFile?.mimetype,
                !!course.pdfFile
              );

              return (
                <Link key={course._id} href={`/cours/${course._id}`}>
                  <div className="group bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                    {/* Header with gradient and file type badge */}
                    <div className="relative h-40 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600">
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                        <span className={fileType.color}>{fileType.name}</span>
                      </div>
                      {course.status && (
                        <div className="absolute top-4 left-4">
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
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col h-full">
                      {/* Title and Creator */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {course.title || course.courseName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>Par {uploader?.username || "Utilisateur"}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
                        {course.description ||
                          "Aucune description disponible pour ce cours."}
                      </p>

                      {/* Tags and Categories */}
                      {(course.category || course.level) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {course.category && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {course.category}
                            </span>
                          )}
                          {course.level && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                              {course.level}
                            </span>
                          )}
                          {course.price !== undefined && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                course.price === 0
                                  ? "bg-green-100 text-green-600"
                                  : "bg-yellow-100 text-yellow-600"
                              }`}
                            >
                              {course.price === 0
                                ? "Gratuit"
                                : `${course.price} TND`}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(course.createdAt)}</span>
                          </div>
                          {fileData && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              <span>{formatFileSize(fileData.size)}</span>
                            </div>
                          )}
                        </div>

                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 text-sm rounded-lg transition-all group-hover:scale-105">
                          Voir
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
