"use client";

import { API_BASE } from "@/lib/api-config";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  Presentation,
  File,
  FileUp,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Users,
  Star,
  Award,
  Zap,
  BadgeCheck,
  Info,
  Clock,
  Trash2,
  Layers,
  ChevronDown,
  Gift,
  CreditCard,
  Tag,
  Languages,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  PageTransition,
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/animated-section";

const ALLOWED_TYPES = [
  // PDF
  "application/pdf",
  // PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Access
  "application/vnd.ms-access",
  "application/x-msaccess",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const FORMATS = [
  { label: "PDF", icon: FileText, color: "text-red-500 bg-red-50" },
  { label: "PPT", icon: Presentation, color: "text-orange-500 bg-orange-50" },
  { label: "Word", icon: FileText, color: "text-blue-500 bg-blue-50" },
  { label: "Excel", icon: FileSpreadsheet, color: "text-green-600 bg-green-50" },
  { label: "Access", icon: File, color: "text-purple-500 bg-purple-50" },
];

// Options de publication du cours (cohérentes avec le modèle backend)
const CATEGORIES = [
  "Développement Web",
  "Data Science",
  "Design",
  "Business",
  "Marketing",
  "Langues",
  "Autre",
];

const LEVELS = ["Débutant", "Intermédiaire", "Avancé"];

const LANGUAGES = [
  "Français",
  "Arabe",
  "Anglais",
  "Espagnol",
  "Allemand",
  "Italien",
  "Autre",
];

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Type de fichier non autorisé. Types acceptés: PDF, PowerPoint, Word, Excel, Access";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "La taille du fichier ne doit pas dépasser 50MB";
  }
  return null;
}

function getFileIcon(file: File) {
  const type = file.type;
  if (type.includes("pdf"))
    return <FileText className="h-6 w-6 text-red-500" />;
  if (type.includes("presentation") || type.includes("powerpoint"))
    return <Presentation className="h-6 w-6 text-orange-500" />;
  if (type.includes("word"))
    return <FileText className="h-6 w-6 text-blue-500" />;
  if (type.includes("sheet") || type.includes("excel"))
    return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
  return <File className="h-6 w-6 text-purple-500" />;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function UploadCoursePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  // Réservé aux moniteurs & admins (cohérent avec le backend monitorOnly)
  const canUpload = !!user && (user.role === "admin" || !!user.isMonitor);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }
    if (!canUpload) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, canUpload, router]);

  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [language, setLanguage] = useState("Français");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading || !isAuthenticated || !canUpload) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const setFileFromInput = (file: File | undefined) => {
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setUploadStatus("error");
      setDocumentFile(null);
      return;
    }
    setErrorMessage("");
    setUploadStatus("idle");
    setDocumentFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileFromInput(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    setFileFromInput(e.dataTransfer.files?.[0]);
  };

  const resetFileInput = () => {
    setDocumentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadStatus("idle");
    setErrorMessage("");

    // Validation
    if (!courseName.trim()) {
      setErrorMessage("Le nom du cours est requis");
      setUploadStatus("error");
      return;
    }

    if (!documentFile) {
      setErrorMessage("Veuillez sélectionner un fichier document");
      setUploadStatus("error");
      return;
    }

    if (!category) {
      setErrorMessage("Veuillez choisir une catégorie");
      setUploadStatus("error");
      return;
    }

    if (!level) {
      setErrorMessage("Veuillez choisir un niveau");
      setUploadStatus("error");
      return;
    }

    if (!isFree && (!price || Number(price) <= 0)) {
      setErrorMessage("Veuillez saisir un prix valide pour un cours payant");
      setUploadStatus("error");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/connexion");
        return;
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("courseName", courseName);
      formData.append("description", description);
      formData.append("category", category || "Autre");
      formData.append("level", level || "Débutant");
      formData.append("price", isFree ? "0" : price);
      formData.append("language", language);
      formData.append("document", documentFile);

      const response = await fetch("${API_BASE}/api/courses/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors du téléchargement du cours"
        );
      }

      setUploadStatus("success");
      setCourseName("");
      setDescription("");
      setCategory("");
      setLevel("");
      setIsFree(true);
      setPrice("");
      setLanguage("Français");
      setDocumentFile(null);
      resetFileInput();

      // Redirect after success
      setTimeout(() => {
        router.push("/cours");
      }, 2000);
    } catch (error) {
      setUploadStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors du téléchargement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden pt-24 pb-16">
        {/* Décorations de fond */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-purple-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-pink-200/25 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/cours"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-all hover:gap-3 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Retour aux cours
          </Link>

          {/* Hero Header Premium */}
          <AnimatedSection className="mb-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 sm:p-12 text-white shadow-2xl shadow-blue-900/20">
              <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 -left-10 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Espace moniteur
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
                  Partagez vos{" "}
                  <span className="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">
                    connaissances
                  </span>
                </h1>
                <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
                  Téléchargez votre cours et aidez des milliers d&apos;apprenants
                  à progresser. Votre savoir mérite d&apos;être partagé.
                </p>

                {/* Stats chips */}
                <div className="flex flex-wrap gap-3 mt-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl">
                    <GraduationCap className="h-4 w-4 text-amber-300" />
                    <span className="text-sm font-medium">+1000 cours partagés</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl">
                    <Users className="h-4 w-4 text-amber-300" />
                    <span className="text-sm font-medium">5 formats supportés</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl">
                    <Zap className="h-4 w-4 text-amber-300" />
                    <span className="text-sm font-medium">Publication instantanée</span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Upload Form */}
            <div className="lg:col-span-2">
              <StaggerContainer className="space-y-6">
                <StaggerItem>
                  <Card className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 rounded-2xl overflow-hidden">
                    <CardHeader className="text-center pb-6 pt-8 relative">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-600/30"
                      >
                        <Upload className="h-8 w-8 text-white" />
                      </motion.div>
                      <CardTitle className="text-2xl font-extrabold text-gray-900">
                        Nouveau cours
                      </CardTitle>
                      <CardDescription className="text-gray-500 mt-2">
                        Remplissez les informations ci-dessous pour publier
                        votre cours
                      </CardDescription>

                      {/* Steps indicator */}
                      <div className="flex items-center justify-center gap-2 mt-6">
                        {[
                          { n: 1, label: "Informations" },
                          { n: 2, label: "Document" },
                          { n: 3, label: "Publication" },
                        ].map((step, i) => (
                          <div key={step.n} className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                  i === 0
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/30"
                                    : i === 1
                                    ? documentFile
                                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                      : "bg-blue-100 text-blue-600"
                                    : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                {i === 1 && documentFile ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  step.n
                                )}
                              </div>
                              <span className="hidden sm:block text-xs font-medium text-gray-600">
                                {step.label}
                              </span>
                            </div>
                            {i < 2 && (
                              <div
                                className={`h-0.5 w-8 rounded-full ${
                                  (i === 0 && (courseName || description)) ||
                                  (i === 1 && documentFile)
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                    : "bg-gray-200"
                                }`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent className="px-6 sm:px-8 pb-8 space-y-6">
                      {/* Status Messages */}
                      <AnimatePresence>
                        {uploadStatus === "success" && (
                          <motion.div
                            initial={{ opacity: 0, y: -12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -12, scale: 0.98 }}
                            className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-start gap-4"
                          >
                            <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-green-900 text-lg">
                                Cours téléchargé avec succès !
                              </h3>
                              <p className="text-green-700 mt-1">
                                Vous allez être redirigé vers la page des
                                cours...
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {uploadStatus === "error" && (
                          <motion.div
                            initial={{ opacity: 0, y: -12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -12, scale: 0.98 }}
                            className="p-5 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl flex items-start gap-4"
                          >
                            <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                              <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-red-900 text-lg">
                                Erreur du téléchargement
                              </h3>
                              <p className="text-red-700 mt-1">{errorMessage}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <form onSubmit={handleSubmit} className="space-y-7">
                        {/* Course Name */}
                        <div className="space-y-2.5">
                          <label
                            htmlFor="course-name"
                            className="block text-sm font-semibold text-gray-700"
                          >
                            Nom du cours <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <BookOpen className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <Input
                              id="course-name"
                              type="text"
                              placeholder="Ex: Introduction à React"
                              value={courseName}
                              onChange={(e) => setCourseName(e.target.value)}
                              disabled={loading}
                              className="w-full h-12 pl-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white/70 rounded-xl transition-all"
                            />
                          </div>
                          <p className="text-sm text-gray-500">
                            Donnez un nom clair et descriptif à votre cours
                          </p>
                        </div>

                        {/* Description */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="description"
                              className="block text-sm font-semibold text-gray-700"
                            >
                              Description
                            </label>
                            <span
                              className={`text-xs font-medium ${
                                description.length > 450
                                  ? "text-amber-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {description.length}/500
                            </span>
                          </div>
                          <Textarea
                            id="description"
                            placeholder="Décrivez le contenu, les objectifs et le public visé par votre cours..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                            maxLength={500}
                            className="w-full min-h-[140px] border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white/70 rounded-xl transition-all resize-none"
                          />
                          <p className="text-sm text-gray-500">
                            Facultatif — Une bonne description aide les autres à
                            comprendre le contenu de votre cours
                          </p>
                        </div>

                        {/* Catégorie & Niveau */}
                        <div className="grid sm:grid-cols-2 gap-5">
                          <div className="space-y-2.5">
                            <label
                              htmlFor="category"
                              className="block text-sm font-semibold text-gray-700"
                            >
                              Catégorie <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Layers className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                              <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={loading}
                                className={`w-full h-12 pl-12 pr-10 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white/70 rounded-xl transition-all appearance-none cursor-pointer ${
                                  category ? "text-gray-900" : "text-gray-400"
                                }`}
                              >
                                <option value="" disabled>
                                  Choisir une catégorie
                                </option>
                                {CATEGORIES.map((c) => (
                                  <option key={c} value={c} className="text-gray-900">
                                    {c}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="h-4 w-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            <label
                              htmlFor="level"
                              className="block text-sm font-semibold text-gray-700"
                            >
                              Niveau <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <TrendingUp className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                              <select
                                id="level"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                disabled={loading}
                                className={`w-full h-12 pl-12 pr-10 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white/70 rounded-xl transition-all appearance-none cursor-pointer ${
                                  level ? "text-gray-900" : "text-gray-400"
                                }`}
                              >
                                <option value="" disabled>
                                  Choisir un niveau
                                </option>
                                {LEVELS.map((l) => (
                                  <option key={l} value={l} className="text-gray-900">
                                    {l}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="h-4 w-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        {/* Gratuit / Payant + Prix */}
                        <div className="grid sm:grid-cols-2 gap-5">
                          <div className="space-y-2.5">
                            <span className="block text-sm font-semibold text-gray-700">
                              Accès
                            </span>
                            <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-gray-100/80 border border-gray-200">
                              <button
                                type="button"
                                onClick={() => setIsFree(true)}
                                disabled={loading}
                                className={`h-10 rounded-lg text-sm font-semibold transition-all ${
                                  isFree
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/25"
                                    : "text-gray-600 hover:bg-white/70"
                                }`}
                              >
                                <span className="inline-flex items-center justify-center gap-1.5">
                                  <Gift className="h-4 w-4" />
                                  Gratuit
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsFree(false)}
                                disabled={loading}
                                className={`h-10 rounded-lg text-sm font-semibold transition-all ${
                                  !isFree
                                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25"
                                    : "text-gray-600 hover:bg-white/70"
                                }`}
                              >
                                <span className="inline-flex items-center justify-center gap-1.5">
                                  <CreditCard className="h-4 w-4" />
                                  Payant
                                </span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            <label
                              htmlFor="price"
                              className="block text-sm font-semibold text-gray-700"
                            >
                              Prix <span className="text-gray-400 font-normal">(€)</span>
                            </label>
                            <div className="relative">
                              <Tag className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                              <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder={isFree ? "Gratuit" : "Ex: 25"}
                                value={isFree ? "" : price}
                                onChange={(e) => setPrice(e.target.value)}
                                disabled={loading || isFree}
                                className="w-full h-12 pl-12 pr-4 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white/70 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                            <p className="text-sm text-gray-500">
                              {isFree
                                ? "Ce cours sera accessible gratuitement à tous"
                                : "Le paiement sera sécurisé via Stripe"}
                            </p>
                          </div>
                        </div>

                        {/* Langue */}
                        <div className="space-y-2.5">
                          <label
                            htmlFor="language"
                            className="block text-sm font-semibold text-gray-700"
                          >
                            Langue <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Languages className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <select
                              id="language"
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                              disabled={loading}
                              className="w-full h-12 pl-12 pr-10 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white/70 rounded-xl transition-all appearance-none cursor-pointer text-gray-900"
                            >
                              {LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>
                                  {lang}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="h-4 w-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Document Upload Area */}
                        <div className="space-y-2.5">
                          <label
                            htmlFor="document-upload"
                            className="block text-sm font-semibold text-gray-700"
                          >
                            Fichier document <span className="text-red-500">*</span>
                          </label>

                          <input
                            ref={fileInputRef}
                            id="document-upload"
                            type="file"
                            accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.mdb,.accdb"
                            onChange={handleFileChange}
                            disabled={loading}
                            className="hidden"
                          />

                          {/* Dropzone Premium */}
                          <motion.div
                            whileHover={{ scale: 1.005 }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragActive(true);
                            }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 overflow-hidden group ${
                              dragActive
                                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 scale-[1.01]"
                                : documentFile
                                ? "border-green-300 bg-green-50/40 hover:bg-green-50/60"
                                : "border-gray-300 bg-white/50 hover:border-blue-400 hover:bg-blue-50/40"
                            }`}
                          >
                            <div
                              className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ${
                                dragActive
                                  ? "opacity-100 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_70%)]"
                                  : ""
                              }`}
                            />

                            <AnimatePresence mode="wait">
                              {documentFile ? (
                                <motion.div
                                  key="file-selected"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="relative flex flex-col items-center gap-4"
                                >
                                  <motion.div
                                    initial={{ scale: 0.6 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      type: "spring",
                                      bounce: 0.5,
                                    }}
                                    className="p-5 rounded-2xl bg-white shadow-lg shadow-green-500/10 border border-green-100"
                                  >
                                    {getFileIcon(documentFile)}
                                  </motion.div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-lg break-all max-w-md">
                                      {documentFile.name}
                                    </p>
                                    <div className="flex items-center justify-center gap-3 mt-1.5">
                                      <span className="text-sm text-gray-500 font-medium">
                                        {formatBytes(documentFile.size)}
                                      </span>
                                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                                      <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                                        <BadgeCheck className="h-4 w-4" />
                                        Prêt à publier
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-3 mt-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        resetFileInput();
                                      }}
                                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Retirer
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                      }}
                                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                      <FileUp className="h-4 w-4" />
                                      Changer
                                    </button>
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="dropzone"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="relative flex flex-col items-center gap-4"
                                >
                                  <motion.div
                                    animate={
                                      dragActive
                                        ? { scale: 1.15, rotate: 3 }
                                        : { scale: 1, rotate: 0 }
                                    }
                                    transition={{ type: "spring", bounce: 0.5 }}
                                    className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 group-hover:from-blue-100 group-hover:to-purple-100 border border-blue-100/80 transition-colors"
                                  >
                                    <Upload className="h-9 w-9 text-blue-600" />
                                  </motion.div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-lg">
                                      Cliquez pour télécharger un document
                                    </p>
                                    <p className="text-gray-500 mt-1">
                                      ou glissez-déposez votre fichier ici
                                    </p>
                                  </div>

                                  {/* Formats badges */}
                                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                                    {FORMATS.map((f) => (
                                      <span
                                        key={f.label}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${f.color}`}
                                      >
                                        <f.icon className="h-3.5 w-3.5" />
                                        {f.label}
                                      </span>
                                    ))}
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500">
                                      <Clock className="h-3.5 w-3.5" />
                                      Max 50 MB
                                    </span>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>

                          {documentFile && (
                            <div className="flex items-center gap-2 text-xs text-green-600 font-medium pt-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Fichier sélectionné avec succès
                            </div>
                          )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-4 pt-4">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1"
                          >
                            <Button
                              type="submit"
                              disabled={loading}
                              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                  Téléchargement en cours...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-5 w-5 mr-2" />
                                  Télécharger le cours
                                </>
                              )}
                            </Button>
                          </motion.div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/cours")}
                            disabled={loading}
                            className="h-12 px-8 text-lg font-semibold border-gray-200 hover:border-gray-300 rounded-xl"
                          >
                            Annuler
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </StaggerContainer>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Guidelines Card */}
              <StaggerItem>
                <Card className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                      </div>
                      Recommandations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      "Assurez-vous que votre fichier est bien formaté et lisible",
                      "Le nom du cours doit être clair et descriptif",
                      "Ajoutez une description détaillée pour aider les apprenants",
                      "Vérifiez que vous avez le droit de partager ce contenu",
                      "Taille maximale du fichier : 50 MB",
                    ].map((guideline, index) => (
                      <div key={index} className="flex gap-3 group">
                        <div className="relative flex-shrink-0 mt-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 group-hover:scale-125 transition-transform" />
                          <div className="absolute inset-0 rounded-full bg-blue-500/40 blur-sm group-hover:blur-md transition-all" />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {guideline}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </StaggerItem>

              {/* Pro tips Card */}
              <StaggerItem>
                <Card className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <Award className="h-5 w-5 text-amber-600" />
                      </div>
                      Astuces Pro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                      <Star className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Les cours avec un titre précis et une description riche
                        sont <span className="font-semibold">2× plus consultés</span>.
                      </p>
                    </div>
                    <div className="flex gap-3 p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                      <Zap className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Structurez votre document avec des sections claires pour
                        faciliter la lecture.
                      </p>
                    </div>
                    <div className="flex gap-3 p-3 rounded-xl bg-purple-50/70 border border-purple-100">
                      <Users className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Un cours de qualité attire des étudiants réguliers et
                        booste votre réputation.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              {/* Community Stats Card */}
              <StaggerItem>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-xl shadow-purple-900/20">
                  <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-20 -left-8 h-44 w-44 rounded-full bg-pink-400/20 blur-2xl" />
                  <CardContent className="relative p-7 text-center">
                    <div className="text-4xl font-extrabold mb-1">
                      +1000
                    </div>
                    <p className="text-blue-100">
                      Cours partagés par la communauté
                    </p>
                    <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15">
                      <div>
                        <div className="text-xl font-bold">5.0</div>
                        <div className="text-[11px] text-blue-200">
                          Note moyenne
                        </div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">1k+</div>
                        <div className="text-[11px] text-blue-200">
                          Étudiants
                        </div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">50MB</div>
                        <div className="text-[11px] text-blue-200">
                          Max fichier
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-blue-100">
                      <GraduationCap className="h-4 w-4" />
                      Rejoignez notre communauté de partage
                    </div>
                  </CardContent>
                </div>
              </StaggerItem>

              {/* Security note */}
              <StaggerItem>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60">
                  <Info className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Votre document sera vérifié avant publication. Assurez-vous
                    de respecter les droits d&apos;auteur et les conditions
                    d&apos;utilisation de la plateforme.
                  </p>
                </div>
              </StaggerItem>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
