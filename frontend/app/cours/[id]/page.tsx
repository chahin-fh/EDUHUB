"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  CreditCard,
  CheckCircle2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  discountPrice?: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

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
          `http://localhost:5000/api/courses/my/enrolled`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          const enrolled = data.enrollments?.some(
            (e: any) => e.course?._id === courseId
          );
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error("Error checking enrollment:", err);
      } finally {
        setCheckingEnrollment(false);
      }
    };
    checkEnrollment();
  }, [courseId, isAuthenticated]);

  // Gérer les query params de retour Stripe
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setIsEnrolled(true);
      toast.success("Paiement réussi ! Vous êtes maintenant inscrit au cours.", {
        duration: 5000,
      });
      // Nettoyer l'URL
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url.toString());
    }
    if (searchParams.get("cancelled") === "true") {
      toast.error("Paiement annulé. Vous n'avez pas été débité.", {
        duration: 5000,
      });
      const url = new URL(window.location.href);
      url.searchParams.delete("cancelled");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

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

  const handlePayment = async () => {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }
    try {
      setIsEnrolling(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        "http://localhost:5000/api/payment/create-checkout-session",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur de paiement");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors du paiement"
      );
    } finally {
      setIsEnrolling(false);
      setShowPaymentDialog(false);
    }
  };

  const handleEnrollFree = async () => {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }
    try {
      setIsEnrolling(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `http://localhost:5000/api/courses/${courseId}/enroll`,
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
                                  {course.discountPrice || course.price} TND
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
                                } TND.`
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
                                ? `${course.discountPrice || course.price} TND`
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

                    {/* Liens rapides après inscription */}
                    <div className="mt-3 text-center">
                      <p className="text-xs text-gray-400">
                        {course.price && course.price > 0
                          ? "Paiement sécurisé par Stripe"
                          : "Aucun paiement nécessaire"}
                      </p>
                    </div>
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
