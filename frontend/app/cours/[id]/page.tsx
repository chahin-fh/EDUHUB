"use client";

import { API_BASE } from "@/lib/api-config";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
// import { useSearchParams } from "next/navigation"; // ⚠️ Paiement commenté
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
  // CreditCard, // ⚠️ Paiement commenté
  CheckCircle2,
  Lock,
  PlayCircle,
  ListChecks,
  HelpCircle,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Star,
  MessageSquare,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
// ⚠️ Paiement commenté : les composants AlertDialog servaient à la
// confirmation d'inscription / paiement
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

interface Lesson {
  _id: string;
  title: string;
  type?: "video" | "text" | "quiz" | "assignment";
  content?: string;
  videoUrl?: string;
  duration?: number;
  isFree?: boolean;
}

interface CourseModule {
  _id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

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
  instructor?: {
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
  discountPrice?: number;
  modules?: CourseModule[];
  rating?: number;
  reviewsCount?: number;
}

interface CourseReview {
  _id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  user?: {
    _id: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
}

// La langue est stockée en toutes lettres (« Français », « Arabe », ...).
// Ce mapping gère uniquement les anciens cours qui utilisaient des codes (ex: "fr").
const LANGUAGE_LABELS: Record<string, string> = {
  fr: "Français",
  en: "Anglais",
  es: "Espagnol",
  de: "Allemand",
  it: "Italien",
  none: "Autre",
};

const getLanguageLabel = (lang?: string) => {
  if (!lang) return "";
  return LANGUAGE_LABELS[lang] || lang;
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  // const searchParams = useSearchParams(); // ⚠️ Paiement commenté
  const { isAuthenticated, user } = useAuth();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  // const [showPaymentDialog, setShowPaymentDialog] = useState(false); // ⚠️ Paiement commenté
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [updatingLesson, setUpdatingLesson] = useState<string | null>(null);

  // Avis du cours
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [reviewStats, setReviewStats] = useState<{
    total: number;
    average: number;
    distribution: number[];
  } | null>(null);
  const [myReview, setMyReview] = useState<CourseReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE}/api/courses/${courseId}`
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

  // Vérifier le statut d'inscription
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!isAuthenticated || !courseId) {
        setCheckingEnrollment(false);
        return;
      }
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `${API_BASE}/api/courses/my/enrolled`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          const myEnrollment = data.enrollments?.find(
            (e: any) => e.course?._id === courseId
          );
          setIsEnrolled(!!myEnrollment);
          if (myEnrollment) {
            setCompletionPercentage(
              myEnrollment.completionPercentage || 0
            );
            const done = new Set<string>();
            (myEnrollment.progress || []).forEach((p: any) => {
              if (p.completed) done.add(`${p.moduleId}:${p.lessonId}`);
            });
            setCompletedLessons(done);
          }
        }
      } catch (err) {
        console.error("Error checking enrollment:", err);
      } finally {
        setCheckingEnrollment(false);
      }
    };
    checkEnrollment();
  }, [courseId, isAuthenticated]);

  // Charger les avis du cours
  useEffect(() => {
    const fetchReviews = async () => {
      if (!courseId) return;
      try {
        setReviewLoading(true);
        const res = await fetch(
          `${API_BASE}/api/course-reviews/${courseId}`
        );
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
          setReviewStats(data.stats || null);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setReviewLoading(false);
      }
    };
    fetchReviews();
  }, [courseId]);

  // Charger mon avis sur ce cours
  useEffect(() => {
    const fetchMyReview = async () => {
      if (!isAuthenticated || !courseId) return;
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `${API_BASE}/api/course-reviews/mine/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setMyReview(data.review || null);
          if (data.review) {
            setReviewForm({
              rating: data.review.rating,
              comment: data.review.comment || "",
            });
          }
        }
      } catch (err) {
        console.error("Error fetching my review:", err);
      }
    };
    fetchMyReview();
  }, [courseId, isAuthenticated]);

  // ⚠️ Gestion des query params de retour Stripe commentée (paiement désactivé) :
  // useEffect(() => {
  //   if (searchParams.get("success") === "true") {
  //     setIsEnrolled(true);
  //     toast.success("Paiement réussi ! Vous êtes maintenant inscrit au cours.", {
  //       duration: 5000,
  //     });
  //     // Nettoyer l'URL
  //     const url = new URL(window.location.href);
  //     url.searchParams.delete("success");
  //     window.history.replaceState({}, "", url.toString());
  //   }
  //   if (searchParams.get("cancelled") === "true") {
  //     toast.error("Paiement annulé. Vous n'avez pas été débité.", {
  //       duration: 5000,
  //     });
  //     const url = new URL(window.location.href);
  //     url.searchParams.delete("cancelled");
  //     window.history.replaceState({}, "", url.toString());
  //   }
  // }, [searchParams]);

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

  // ⚠️ Fonction de paiement (Stripe) commentée :
  // const handlePayment = async () => {
  //   if (!isAuthenticated) {
  //     router.push("/connexion");
  //     return;
  //   }
  //   try {
  //     setIsEnrolling(true);
  //     const token = localStorage.getItem("authToken");
  //     const res = await fetch(
  //       `${API_BASE}/api/payment/create-checkout-session`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ courseId }),
  //       }
  //     );
  //     const data = await res.json();
  //     if (!res.ok) {
  //       throw new Error(data.message || "Erreur de paiement");
  //     }
  //     if (data.url) {
  //       window.location.href = data.url;
  //     }
  //   } catch (err) {
  //     toast.error(
  //       err instanceof Error ? err.message : "Erreur lors du paiement"
  //     );
  //   } finally {
  //     setIsEnrolling(false);
  //     setShowPaymentDialog(false);
  //   }
  // };

  const handleEnrollFree = async () => {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }
    try {
      setIsEnrolling(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${API_BASE}/api/courses/${courseId}/enroll`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        setIsEnrolled(true);
        toast.success("Inscription réussie !", { duration: 4000 });
      } else {
        throw new Error(data.message || "Erreur d'inscription");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de l'inscription"
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleToggleLesson = async (
    moduleId: string,
    lessonId: string,
    currentCompleted: boolean
  ) => {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }
    setUpdatingLesson(`${moduleId}:${lessonId}`);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${API_BASE}/api/courses/${courseId}/progress`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            moduleId,
            lessonId,
            completed: !currentCompleted,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur de progression");
      }
      if (data.enrollment) {
        setCompletionPercentage(
          data.enrollment.completionPercentage || 0
        );
      }
      const key = `${moduleId}:${lessonId}`;
      setCompletedLessons((prev) => {
        const next = new Set(prev);
        if (currentCompleted) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
      toast.success(
        currentCompleted ? "Leçon marquée comme non terminée" : "Leçon terminée ✓",
        { duration: 2500 }
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
    } finally {
      setUpdatingLesson(null);
    }
  };

  const getLessonIcon = (type?: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case "text":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "quiz":
        return <HelpCircle className="h-4 w-4 text-amber-500" />;
      case "assignment":
        return <ClipboardList className="h-4 w-4 text-green-600" />;
      default:
        return <ListChecks className="h-4 w-4 text-gray-400" />;
    }
  };

  const refreshReviews = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/course-reviews/${courseId}`
      );
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setReviewStats(data.stats || null);
      }
    } catch (err) {
      console.error("Error refreshing reviews:", err);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }
    if (reviewForm.rating < 1) {
      toast.error("Veuillez choisir une note (1 à 5 étoiles)");
      return;
    }
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("authToken");
      const isUpdate = !!myReview;
      const res = await fetch(
        isUpdate
          ? `${API_BASE}/api/course-reviews/${myReview._id}`
          : `${API_BASE}/api/course-reviews`,
        {
          method: isUpdate ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId,
            rating: reviewForm.rating,
            comment: reviewForm.comment,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi de l'avis");
      }
      toast.success(
        isUpdate ? "Avis mis à jour avec succès !" : "Merci pour votre avis !"
      );
      setMyReview(data.review);
      setEditingReview(false);
      refreshReviews();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de l'envoi de l'avis"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${API_BASE}/api/course-reviews/${myReview._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la suppression");
      }
      toast.success("Avis supprimé");
      setMyReview(null);
      setEditingReview(false);
      setReviewForm({ rating: 0, comment: "" });
      refreshReviews();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression de l'avis"
      );
    }
  };

  const renderStars = (rating: number, size: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            style={{ width: size, height: size }}
            className={`${
              star <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleDownload = async () => {
    if (!course) return;
    const currentUserId = ((user as any)?._id || (user as any)?.id || "").toString();
    const ownerId = (course.uploadedBy?._id || course.instructor?._id)?.toString();
    const isOwner = !!currentUserId && !!ownerId && currentUserId === ownerId;

    if (!isOwner && user?.role !== "admin" && !isEnrolled) {
      toast.error("Inscrivez-vous à ce cours pour télécharger son contenu");
      return;
    }

    try {
      setDownloading(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${API_BASE}/api/courses/${courseId}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors du téléchargement");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        course.documentFile?.originalName ||
        course.pdfFile?.originalName ||
        course.title ||
        course.courseName ||
        "cours";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      toast.error(
        err instanceof Error ? err.message : "Erreur lors du téléchargement"
      );
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
  const currentUserId = ((user as any)?._id || (user as any)?.id || "").toString();
  const courseOwnerId = (
    course.uploadedBy?._id || course.instructor?._id
  )?.toString();
  const isCourseOwner =
    !!currentUserId && !!courseOwnerId && currentUserId === courseOwnerId;
  const canDownload = isEnrolled || isCourseOwner || user?.role === "admin";

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
                        {course.price === 0 ? "Gratuit" : `${course.price} €`}
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
                    {getLanguageLabel(course.language)}
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

            {/* Contenu du cours (modules/leçons) pour les inscrits */}
            {isEnrolled && course.modules && course.modules.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Contenu du cours
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-blue-600">
                      {completionPercentage}%
                    </span>
                    <div className="w-40">
                      <Progress
                        value={completionPercentage}
                        max={100}
                        className="h-2.5 rounded-full bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Marquez chaque leçon comme terminée pour suivre votre
                  progression.
                </p>
                <div className="space-y-4">
                  {course.modules.map((module, mi) => {
                    const isOpen = openModules.has(module._id);
                    const moduleDone = module.lessons.every(
                      (l) =>
                        completedLessons.has(`${module._id}:${l._id}`) ||
                        !!l.isFree
                    );
                    return (
                      <div
                        key={module._id}
                        className="rounded-xl border border-gray-100 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenModules((prev) => {
                              const next = new Set(prev);
                              if (isOpen) next.delete(module._id);
                              else next.add(module._id);
                              return next;
                            });
                          }}
                          className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                moduleDone
                                  ? "bg-green-100 text-green-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {mi + 1}
                            </span>
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">
                                {module.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {module.lessons.length} leçon(s)
                              </p>
                            </div>
                          </div>
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="divide-y divide-gray-50 border-t border-gray-100">
                            {module.lessons.map((lesson) => {
                              const lessonKey = `${module._id}:${lesson._id}`;
                              const isDone = completedLessons.has(lessonKey);
                              const busy = updatingLesson === lessonKey;
                              return (
                                <div
                                  key={lesson._id}
                                  className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50/30 transition-colors"
                                >
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() =>
                                      handleToggleLesson(
                                        module._id,
                                        lesson._id,
                                        isDone
                                      )
                                    }
                                    className={`flex items-center gap-3 flex-1 text-left transition-colors ${
                                      isDone
                                        ? "text-green-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {busy ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    ) : isDone ? (
                                      <CheckSquare className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Square className="h-4 w-4 text-gray-300" />
                                    )}
                                    {getLessonIcon(lesson.type)}
                                    <span
                                      className={`text-sm font-medium ${
                                        isDone
                                          ? "line-through text-green-600"
                                          : ""
                                      }`}
                                    >
                                      {lesson.title}
                                    </span>
                                  </button>
                                  {lesson.duration && (
                                    <span className="text-xs text-gray-400">
                                      {Math.round(lesson.duration)} min
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
              {canDownload ? (
                <>
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
                </>
              ) : (
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">
                      Contenu réservé aux inscrits
                    </p>
                    <p className="text-xs text-white/75 mt-1 leading-relaxed">
                      Inscrivez-vous à ce cours pour télécharger le document.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Inscription / Paiement */}
            {!checkingEnrollment && (
              <>
                {isEnrolled ? (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 shadow-lg text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle2 className="h-8 w-8" />
                      <h3 className="text-xl font-bold">Inscrit !</h3>
                    </div>
                    <p className="text-white/90 text-sm mb-4">
                      Vous êtes inscrit à ce cours. Bon apprentissage !
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard")}
                      className="w-full bg-white text-green-700 hover:bg-gray-100 font-semibold rounded-lg transition-all"
                      size="lg"
                    >
                      Voir ma progression
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* ⚠️ Paiement commenté : inscription directe (gratuite) */}
                    <Button
                      size="lg"
                      disabled={isEnrolling}
                      onClick={handleEnrollFree}
                      className="w-full rounded-xl font-semibold py-6 transition-all transform hover:scale-105 text-lg shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isEnrolling ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Inscription en cours...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          S&apos;inscrire gratuitement
                        </>
                      )}
                    </Button>

                    {/* Ancien dialogue d'inscription / paiement (Stripe) commenté :
                    <AlertDialog
                      open={showPaymentDialog}
                      onOpenChange={setShowPaymentDialog}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          size="lg"
                          disabled={isEnrolling}
                          className={`w-full rounded-xl font-semibold py-6 transition-all transform hover:scale-105 text-lg shadow-xl ${
                            course.price && course.price > 0
                              ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          }`}
                        >
                          {isEnrolling ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                              {course.price && course.price > 0
                                ? "Redirection vers le paiement..."
                                : "Inscription en cours..."}
                            </>
                          ) : (
                            <>
                              {course.price && course.price > 0 ? (
                                <>
                                  <CreditCard className="h-5 w-5 mr-2" />
                                  S&apos;inscrire –{" "}
                                  {course.discountPrice || course.price} €
                                </>
                              ) : (
                                <>
                                  <Lock className="h-5 w-5 mr-2" />
                                  S&apos;inscrire gratuitement
                                </>
                              )}
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirmer votre inscription
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {course.price && course.price > 0
                              ? `Vous allez être redirigé vers Stripe pour payer ${
                                  course.discountPrice || course.price
                                } €.`
                              : "Ce cours est gratuit. Confirmez pour vous inscrire immédiatement."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="bg-gray-50 rounded-lg p-4 my-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">
                              {course.title || course.courseName}
                            </span>
                            <span className="font-bold text-lg">
                              {course.price && course.price > 0
                                ? `${course.discountPrice || course.price} €`
                                : "Gratuit"}
                            </span>
                          </div>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={
                              course.price && course.price > 0
                                ? handlePayment
                                : handleEnrollFree
                            }
                            disabled={isEnrolling}
                            className={
                              course.price && course.price > 0
                                ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            }
                          >
                            {isEnrolling ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                {course.price && course.price > 0
                                  ? "Paiement..."
                                  : "Inscription..."}
                              </>
                            ) : course.price && course.price > 0 ? (
                              "Payer avec Stripe"
                            ) : (
                              "Confirmer l'inscription"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    [// Liens rapides après inscription]
                    <div className="mt-3 text-center">
                      <p className="text-xs text-gray-400">
                        {course.price && course.price > 0
                          ? "Paiement sécurisé par Stripe"
                          : "Aucun paiement nécessaire"}
                      </p>
                    </div>
                    */}
                  </>
                )}
              </>
            )}

            {/* Charge indication */}
            {checkingEnrollment && (
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            )}

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
                        {course.price === 0 ? "Gratuit" : `${course.price} €`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Avis des étudiants */}
        <div className="mt-12">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row gap-10">
              {/* Résumé des notes */}
              <div className="md:w-80 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                  Avis des étudiants
                </h2>
                {reviewStats && reviewStats.total > 0 ? (
                  <>
                    <div className="flex items-end gap-3">
                      <span className="text-6xl font-extrabold text-gray-900 leading-none">
                        {reviewStats.average}
                      </span>
                      <div className="pb-1">{renderStars(reviewStats.average, 20)}</div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Basé sur {reviewStats.total} avis
                    </p>
                    <div className="mt-6 space-y-2.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviewStats.distribution[star - 1] || 0;
                        const pct = reviewStats.total
                          ? Math.round((count / reviewStats.total) * 100)
                          : 0;
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-gray-600 font-semibold">
                              {star}
                            </span>
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-gray-400">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">
                    Aucun avis pour le moment. Soyez le premier à partager votre
                    expérience !
                  </p>
                )}
              </div>

              {/* Formulaire + liste */}
              <div className="flex-1">
                {isAuthenticated && isEnrolled && (
                  <div className="mb-8 p-5 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/50">
                    <h3 className="font-bold text-gray-900 mb-3">
                      {myReview && !editingReview
                        ? "Votre avis"
                        : myReview
                        ? "Modifier votre avis"
                        : "Laisser un avis"}
                    </h3>

                    {myReview && !editingReview ? (
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex gap-1 mb-2">
                            {renderStars(myReview.rating, 18)}
                          </div>
                          {myReview.comment && (
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {myReview.comment}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingReview(true)}
                            className="gap-1.5 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Modifier
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteReview}
                            className="gap-1.5 border-gray-300 text-red-600 hover:border-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex gap-1.5 mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setReviewForm((f) => ({ ...f, rating: star }))
                              }
                              className="transition-transform hover:scale-125 focus:outline-none"
                              aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                            >
                              <Star
                                className={`h-8 w-8 transition-colors ${
                                  star <= reviewForm.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300 hover:text-amber-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) =>
                            setReviewForm((f) => ({
                              ...f,
                              comment: e.target.value,
                            }))
                          }
                          maxLength={1000}
                          rows={3}
                          placeholder="Partagez votre expérience avec ce cours : qualité du contenu, clarté, utilité..."
                          className="w-full min-h-[90px] rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none transition-all"
                        />
                        <div className="flex items-center gap-3 mt-3">
                          <Button
                            type="button"
                            onClick={handleSubmitReview}
                            disabled={submittingReview}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold"
                          >
                            {submittingReview ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Envoi...
                              </>
                            ) : myReview ? (
                              "Enregistrer les modifications"
                            ) : (
                              "Publier l'avis"
                            )}
                          </Button>
                          {myReview && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setEditingReview(false);
                                setReviewForm({
                                  rating: myReview.rating,
                                  comment: myReview.comment || "",
                                });
                              }}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              Annuler
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isAuthenticated && !isEnrolled && (
                  <p className="text-sm text-gray-500 mb-6">
                    Inscrivez-vous à ce cours pour laisser votre avis.
                  </p>
                )}

                {reviewLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      Aucun avis publié pour ce cours pour le moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold uppercase">
                              {(review.user?.username ||
                                review.user?.name ||
                                "A").charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {review.user?.username ||
                                review.user?.name ||
                                "Anonyme"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                          <div className="ml-auto">
                            {renderStars(review.rating, 16)}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
