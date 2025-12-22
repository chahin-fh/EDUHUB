"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function UploadCoursePage() {
  const router = useRouter();
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Types de fichiers autorisés
      const allowedTypes = [
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

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(
          "Type de fichier non autorisé. Types acceptés: PDF, PowerPoint, Word, Excel, Access"
        );
        setDocumentFile(null);
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrorMessage("La taille du fichier ne doit pas dépasser 50MB");
        setDocumentFile(null);
        return;
      }
      setErrorMessage("");
      setDocumentFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadStatus("idle");
    setErrorMessage("");

    // Validation
    if (!courseName.trim()) {
      setErrorMessage("Le nom du cours est requis");
      return;
    }

    if (!documentFile) {
      setErrorMessage("Veuillez sélectionner un fichier document");
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
      formData.append("document", documentFile);

      const response = await fetch("http://localhost:5000/api/courses/upload", {
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
      setDocumentFile(null);

      // Reset file input
      const fileInput = document.getElementById(
        "document-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Link
            href="/cours"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            ← Retour aux cours
          </Link>
          <div className="mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Partager vos connaissances
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Téléchargez votre cours au format PDF et aidez d&apos;autres
              personnes à apprendre
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Upload Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Nouveau cours
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Remplissez les informations ci-dessous pour télécharger votre
                  cours
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Status Messages */}
                {uploadStatus === "success" && (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-start gap-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 text-lg">
                        Cours téléchargé avec succès!
                      </h3>
                      <p className="text-green-700 mt-1">
                        Vous allez être redirigé vers la page des cours...
                      </p>
                    </div>
                  </div>
                )}

                {uploadStatus === "error" && (
                  <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 text-lg">
                        Erreur du téléchargement
                      </h3>
                      <p className="text-red-700 mt-1">{errorMessage}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Course Name */}
                  <div className="space-y-3">
                    <label
                      htmlFor="course-name"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Nom du cours <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="course-name"
                      type="text"
                      placeholder="Ex: Introduction à React"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      disabled={loading}
                      className="w-full h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/50"
                    />
                    <p className="text-sm text-gray-500">
                      Donnez un nom clair et descriptif à votre cours
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <label
                      htmlFor="description"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Description
                    </label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez le contenu, les objectifs et le public visé par votre cours..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={loading}
                      className="w-full min-h-[140px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/50 resize-none"
                    />
                    <p className="text-sm text-gray-500">
                      Facultatif - Une bonne description aide les autres à
                      comprendre le contenu de votre cours
                    </p>
                  </div>

                  {/* Document Upload Area */}
                  <div className="space-y-3">
                    <label
                      htmlFor="document-upload"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Fichier document <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="document-upload"
                        type="file"
                        accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.mdb,.accdb"
                        onChange={handleFileChange}
                        disabled={loading}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group">
                        <label
                          htmlFor="document-upload"
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
                              <Upload className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">
                                {documentFile
                                  ? documentFile.name
                                  : "Cliquez pour télécharger un document"}
                              </p>
                              <p className="text-gray-500 mt-1">
                                ou glissez-déposez votre fichier ici
                              </p>
                              <p className="text-sm text-gray-400 mt-2">
                                Types acceptés: PDF, PowerPoint, Word, Excel,
                                Access
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Taille maximale: 50MB
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>

                      {documentFile && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-full">
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {documentFile.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {(documentFile.size / 1024 / 1024).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setDocumentFile(null);
                                const fileInput = document.getElementById(
                                  "document-upload"
                                ) as HTMLInputElement;
                                if (fileInput) fileInput.value = "";
                              }}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Changer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/cours")}
                      disabled={loading}
                      className="h-12 px-8 text-lg font-semibold"
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Guidelines Card */}
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  Recommandations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Assurez-vous que votre fichier PDF est bien formaté et lisible",
                  "Le nom du cours doit être clair et descriptif",
                  "Ajoutez une description détaillée pour aider les apprenants",
                  "Vérifiez que vous avez le droit de partager ce contenu",
                  "Taille maximale du fichier: 50MB",
                ].map((guideline, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {guideline}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold mb-2">+1000</div>
                <p className="text-blue-100">
                  Cours partagés par la communauté
                </p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm text-blue-100">
                    Rejoignez notre communauté de partage de connaissances
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
