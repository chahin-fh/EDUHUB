"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Star,
  BookOpen,
  Users,
  Award,
  Clock,
  CheckCircle,
  User,
  MapPin,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "user";
  isMonitor: boolean;
  monitorProfile?: {
    expertise: string[];
    verified: boolean;
    rating: number;
    coursesCreated: number;
  };
  avatar?: string;
  bio?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  emailVerified: boolean;
}

interface Course {
  _id: string;
  courseName: string;
  description: string;
  createdAt: string;
  status: string;
  category?: string;
  level?: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);

      // Vérifier si l'utilisateur est authentifié
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      console.log("Token présent:", !!token);
      console.log("User ID:", userId);

      // Si pas de token, ne pas essayer de faire l'appel API
      if (!token) {
        console.log("Aucun token trouvé, redirection vers la connexion");
        setError("Veuillez vous connecter pour accéder à cette page.");
        router.push("/connexion");
        return;
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(
        `http://localhost:5000/api/usersList/${userId}`,
        { headers }
      );

      console.log("Status de la réponse:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur de réponse:", errorText);

        // Si le token est invalide, le supprimer et rediriger
        if (response.status === 401) {
          console.log("Token invalide, suppression et redirection");
          if (typeof window !== "undefined") {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
          }
          router.push("/connexion");
          return;
        }

        if (response.status === 404) {
          setError("Utilisateur non trouvé");
          return;
        }

        throw new Error(
          `Failed to fetch user: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Données reçues:", data);

      if (data.success) {
        setUser(data.user);
        setCourses(data.courses || []);
        setError("");
        console.log("Utilisateur chargé avec succès:", data.user.name);
      } else {
        console.error("Erreur dans les données:", data.message);
        setError(data.message || "Error fetching user details");
      }
    } catch (err: any) {
      console.error("Error fetching user details:", err);
      setError("Erreur lors du chargement des détails de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadge = (role: string, isMonitor: boolean) => {
    if (role === "admin") {
      return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
    }
    if (isMonitor) {
      return <Badge className="bg-blue-100 text-blue-800">Moniteur</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Utilisateur</Badge>;
  };

  const getRoleIcon = (role: string, isMonitor: boolean) => {
    if (role === "admin") return <Shield className="h-6 w-6 text-red-600" />;
    if (isMonitor) return <Star className="h-6 w-6 text-blue-600" />;
    return <Users className="h-6 w-6 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Chargement des détails...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/users"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux utilisateurs
          </Link>

          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {error || "Utilisateur non trouvé"}
              </h3>
              <p className="text-gray-600 mb-8">
                L&apos;utilisateur que vous recherchez n&apos;existe pas ou a
                été supprimé.
              </p>
              <Link href="/users">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Retourner aux utilisateurs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/users"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux utilisateurs
        </Link>

        {/* Hero Section */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="text-white text-4xl font-bold">
                    {user.name?.charAt(0) || user.username?.charAt(0) || "U"}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                  <h1 className="text-4xl font-bold text-gray-900">
                    {user.name || user.username}
                  </h1>
                  {getRoleBadge(user.role, user.isMonitor)}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.lastLogin && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Dernière connexion: {formatDate(user.lastLogin)}
                      </span>
                    </div>
                  )}
                </div>

                {user.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">{user.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      Inscrit le {formatDate(user.createdAt)}
                    </span>
                  </div>
                  {user.emailVerified && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Email vérifié</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Role Icon */}
              <div className="flex-shrink-0">
                {getRoleIcon(user.role, user.isMonitor)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Monitor Profile */}
            {(user.isMonitor || user.role === "admin") && (
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="h-6 w-6 text-blue-600" />
                  Profil Moniteur
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {user.monitorProfile?.coursesCreated || 0}
                    </div>
                    <div className="text-sm text-gray-600">Cours créés</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {user.monitorProfile?.rating || 0}
                    </div>
                    <div className="text-sm text-gray-600">Note moyenne</div>
                  </div>
                </div>

                {/* Expertise */}
                {user.monitorProfile?.expertise &&
                  user.monitorProfile.expertise.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Domaines d&apos;expertise
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {user.monitorProfile.expertise.map(
                          (expertise, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-sm"
                            >
                              {expertise}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {user.monitorProfile?.verified && (
                  <div className="mt-6 flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                    <Award className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      Moniteur vérifié
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Courses */}
            {courses.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  Cours de {user.name || user.username}
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {courses.map((course) => (
                    <Link key={course._id} href={`/cours/${course._id}`}>
                      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                              {course.courseName}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {course.description}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {course.status && (
                              <Badge
                                variant={
                                  course.status === "published"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {course.status === "published"
                                  ? "Publié"
                                  : course.status}
                              </Badge>
                            )}
                            {course.category && (
                              <Badge variant="outline" className="text-xs">
                                {course.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(course.createdAt)}</span>
                          </div>
                          {course.level && <span>Niveau: {course.level}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Actions rapides
              </h3>
              <div className="space-y-3">
                <Button className="w-full gap-2">
                  <Mail className="h-4 w-4" />
                  Contacter
                </Button>
                {user.isMonitor && (
                  <Button variant="outline" className="w-full gap-2">
                    <Star className="h-4 w-4" />
                    Suivre
                  </Button>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Statut</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Compte actif</span>
                  <Badge
                    className={
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {user.isActive ? "Oui" : "Non"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email vérifié</span>
                  <Badge
                    className={
                      user.emailVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {user.emailVerified ? "Oui" : "Non"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rôle</span>
                  {getRoleBadge(user.role, user.isMonitor)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
