"use client";

import { API_BASE } from "@/lib/api-config";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Clock,
  Users,
  Loader2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Zap,
  Layers,
  X,
  FileText,
  FileSpreadsheet,
  Presentation,
  File,
  ShieldCheck,
  Star,
} from "lucide-react";
import Link from "next/link";
import {
  PageTransition,
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/animated-section";

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
  rating?: number;
  reviewsCount?: number;
}

const CARD_GRADIENTS = [
  "from-blue-500 via-indigo-600 to-purple-700",
  "from-purple-500 via-purple-600 to-pink-600",
  "from-indigo-500 via-blue-600 to-cyan-600",
  "from-violet-600 via-purple-600 to-blue-600",
  "from-blue-600 via-blue-500 to-fuchsia-600",
  "from-fuchsia-500 via-purple-600 to-indigo-600",
];

function fileBadge(mimetype?: string, isPdfFile?: boolean) {
  if (isPdfFile) {
    return {
      name: "PDF",
      icon: FileText,
      color: "text-red-600 bg-red-50",
    };
  }
  if (!mimetype) {
    return {
      name: "Document",
      icon: File,
      color: "text-gray-600 bg-gray-100",
    };
  }
  const map: Record<string, { name: string; icon: any; color: string }> = {
    "application/pdf": { name: "PDF", icon: FileText, color: "text-red-600 bg-red-50" },
    "application/vnd.ms-powerpoint": {
      name: "PPT",
      icon: Presentation,
      color: "text-orange-600 bg-orange-50",
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      name: "PPTX",
      icon: Presentation,
      color: "text-orange-600 bg-orange-50",
    },
    "application/msword": { name: "DOC", icon: FileText, color: "text-blue-600 bg-blue-50" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      name: "DOCX",
      icon: FileText,
      color: "text-blue-600 bg-blue-50",
    },
    "application/vnd.ms-excel": {
      name: "XLS",
      icon: FileSpreadsheet,
      color: "text-green-600 bg-green-50",
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      name: "XLSX",
      icon: FileSpreadsheet,
      color: "text-green-600 bg-green-50",
    },
    "application/vnd.ms-access": {
      name: "MDB",
      icon: File,
      color: "text-purple-600 bg-purple-50",
    },
    "application/x-msaccess": {
      name: "MDB",
      icon: File,
      color: "text-purple-600 bg-purple-50",
    },
    "application/vnd.ms-access.accdb": {
      name: "ACCDB",
      icon: File,
      color: "text-purple-600 bg-purple-50",
    },
  };
  return (
    map[mimetype] || {
      name: mimetype.split("/")[1]?.toUpperCase() || "Document",
      icon: File,
      color: "text-gray-600 bg-gray-100",
    }
  );
}

export default function CoursePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/courses`);

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

  const categories = Array.from(
    new Set(courses.map((c) => c.category).filter(Boolean) as string[])
  );

  const filteredCourses = courses
    .filter(
      (course) =>
        (activeCategory === "all" ||
          course.category === activeCategory) &&
        (course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()))
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

  const freeCount = courses.filter((c) => c.price === 0).length;

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

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden pt-24 pb-16">
        {/* Décorations de fond */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -left-40 h-[28rem] w-[28rem] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-pink-200/25 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Premium */}
          <AnimatedSection className="mb-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 sm:p-14 text-white shadow-2xl shadow-blue-900/20">
              <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 -left-10 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

              <div className="relative z-10 text-center">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Bibliothèque de cours
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
                  Découvrez{" "}
                  <span className="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">
                    nos cours
                  </span>
                </h1>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
                  Explorez une collection de formations complètes dans divers
                  domaines. Apprenez à votre rythme avec des documents de
                  qualité.
                </p>

                {/* Stats chips */}
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  <Link href="/cours/upload">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-green-500/25 transition-all cursor-pointer">
                      <Plus className="h-4 w-4" />
                      Ajouter un cours
                    </span>
                  </Link>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl">
                    <GraduationCap className="h-4 w-4 text-amber-300" />
                    <span className="text-sm font-medium">
                      {loading ? "…" : `${courses.length} cours disponibles`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl">
                    <ShieldCheck className="h-4 w-4 text-amber-300" />
                    <span className="text-sm font-medium">
                      {loading ? "…" : `${freeCount} cours gratuits`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl">
                    <Zap className="h-4 w-4 text-amber-300" />
                    <span className="text-sm font-medium">
                      5 formats supportés
                    </span>
                  </div>
                </div>

                {/* Search Bar intégrée au hero */}
                <div className="max-w-xl mx-auto mt-10">
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Rechercher un cours..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-12 h-14 text-lg bg-white/95 backdrop-blur-sm border-0 focus:ring-4 focus:ring-white/30 shadow-xl rounded-2xl text-gray-900 placeholder:text-gray-400"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Filters par catégorie */}
          {categories.length > 0 && (
            <AnimatedSection delay={0.1} className="mb-10">
              <div className="flex flex-wrap items-center gap-2 justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500">
                  <Layers className="h-3.5 w-3.5" />
                  Filtrer :
                </span>
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === "all"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/25"
                      : "bg-white/80 border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50"
                  }`}
                >
                  Tous
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCategory === cat
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/25"
                        : "bg-white/80 border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </AnimatedSection>
          )}

          {/* Résultats count */}
          {!loading && !error && filteredCourses.length > 0 && (
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500">
                <span className="font-bold text-blue-600">
                  {filteredCourses.length}
                </span>{" "}
                cours{" "}
                {searchTerm || activeCategory !== "all"
                  ? "trouvé(s)"
                  : "disponibles"}
              </p>
            </div>
          )}

          {/* Content Section */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  Chargement des cours...
                </p>
              </div>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-8 shadow-xl max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {error}
                </h3>
                <p className="text-gray-600 mb-8">
                  Une erreur est survenue lors du chargement des cours.
                  Veuillez réessayer plus tard.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
                >
                  Réessayer
                </Button>
              </div>
            </motion.div>
          ) : filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 blur-xl" />
                <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {courses.length === 0
                  ? "Aucun cours disponible"
                  : "Aucun cours trouvé"}
              </h3>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                {courses.length === 0
                  ? "Aucun cours n'a été téléchargé pour le moment. Revenez plus tard !"
                  : "Aucun cours ne correspond à votre recherche. Essayez avec d'autres termes."}
              </p>
              {(searchTerm || activeCategory !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("all");
                  }}
                  className="border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl"
                >
                  Effacer la recherche
                </Button>
              )}
            </motion.div>
          ) : (
            <StaggerContainer
              key={activeCategory}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredCourses.map((course, index) => {
                const uploader = course.uploadedBy || course.uploader;
                const fileData = course.documentFile || course.pdfFile;
                const badge = fileBadge(
                  course.documentFile?.mimetype,
                  !!course.pdfFile
                );
                const BadgeIcon = badge.icon;
                const gradient =
                  CARD_GRADIENTS[index % CARD_GRADIENTS.length];

                return (
                  <StaggerItem key={course._id}>
                    <Link href={`/cours/${course._id}`} className="block h-full">
                      <motion.div
                        whileHover={{ y: -6, scale: 1.01 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                        className="group h-full bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-lg shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 cursor-pointer relative"
                      >
                        {/* Header with gradient and file type badge */}
                        <div
                          className={`relative h-44 bg-gradient-to-br ${gradient} overflow-hidden`}
                        >
                          <div className="pointer-events-none absolute -top-10 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl group-hover:scale-125 transition-transform duration-500" />
                          <div className="pointer-events-none absolute -bottom-12 -left-6 h-36 w-36 rounded-full bg-pink-400/20 blur-2xl" />
                          <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />

                          {/* File badge */}
                          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md bg-white/95 backdrop-blur-sm">
                            <span className={`inline-flex items-center gap-1.5 ${badge.color}`}>
                              <BadgeIcon className="h-3.5 w-3.5" />
                              {badge.name}
                            </span>
                          </div>

                          {/* Status */}
                          {course.status && (
                            <div className="absolute top-4 left-4">
                              <span
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                                  course.status === "published"
                                    ? "bg-green-100/95 text-green-800"
                                    : course.status === "draft"
                                    ? "bg-gray-100/95 text-gray-700"
                                    : "bg-yellow-100/95 text-yellow-800"
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

                          {/* Center icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-xl group-hover:rotate-3 group-hover:scale-110 transition-transform duration-300">
                              <BookOpen className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col">
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {course.title || course.courseName}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-bold text-white uppercase">
                                  {(uploader?.username || "U").charAt(0)}
                                </span>
                              </div>
                              <span>
                                Par{" "}
                                <span className="font-medium text-gray-700">
                                  {uploader?.username || "Utilisateur"}
                                </span>
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm mb-5 line-clamp-3 flex-1 leading-relaxed">
                            {course.description ||
                              "Aucune description disponible pour ce cours."}
                          </p>

                          {/* Tags */}
                          {(course.category || course.level) && (
                            <div className="flex flex-wrap gap-2 mb-5">
                              {course.category && (
                                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                  {course.category}
                                </span>
                              )}
                              {course.level && (
                                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                  {course.level}
                                </span>
                              )}
                              {course.price !== undefined && (
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    course.price === 0
                                      ? "bg-green-100 text-green-600"
                                      : "bg-amber-100 text-amber-600"
                                  }`}
                                >
                                  {course.price === 0
                                    ? "Gratuit"
                                    : `${course.price} €`}
                                </span>
                              )}
                              {course.rating !== undefined &&
                                course.rating > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    {course.rating}
                                    <span className="text-amber-600/70 font-normal">
                                      ({course.reviewsCount || 0})
                                    </span>
                                  </span>
                                )}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(course.createdAt)}</span>
                              </div>
                              {fileData && (
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  <span>{formatFileSize(fileData.size)}</span>
                                </div>
                              )}
                            </div>

                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-blue-600/25">
                              Voir
                              <ChevronRight className="h-4 w-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
