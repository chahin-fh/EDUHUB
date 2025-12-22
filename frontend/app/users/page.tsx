"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Users,
  Mail,
  Calendar,
  Shield,
  Star,
  BookOpen,
  Loader2,
  ChevronRight,
  UserCheck,
  UserX,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

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

interface UserStats {
  total: number;
  admin: number;
  user: number;
  monitors: number;
  activeMonitors: number;
}

export default function UsersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); // Pour le debounce
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Filtres utilisateurs locaux pour recherche instantanée
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 300); // 300ms de debounce

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Filtrage local pour recherche instantanée
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;

    const searchLower = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.monitorProfile?.expertise?.some((exp) =>
          exp.toLowerCase().includes(searchLower)
        ) ||
        user.bio?.toLowerCase().includes(searchLower)
    );
  }, [users, searchTerm]);

  const fetchUsers = useCallback(async () => {
    try {
      console.log("Début du chargement des utilisateurs...");
      setLoading(true);

      // Vérifier si l'utilisateur est authentifié
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      console.log("Token présent:", !!token);
      console.log(
        "Token (premiers caractères):",
        token ? token.substring(0, 20) + "..." : "null"
      );

      // Si pas de token, ne pas essayer de faire l'appel API
      if (!token) {
        console.log("Aucun token trouvé, redirection vers la connexion");
        setError("Veuillez vous connecter pour accéder à cette page.");
        router.push("/connexion");
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "50", // Augmenter la limite pour plus d'utilisateurs
        sortBy,
        sortOrder,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedSubject) params.append("subject", selectedSubject);
      if (selectedRole) params.append("role", selectedRole);
      if (selectedStatus) params.append("status", selectedStatus);

      console.log(
        "URL de l'API:",
        `http://localhost:5000/api/usersList?${params}`
      );

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      console.log("Headers de la requête:", headers);

      // Système de retry pour l'erreur 429
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 1000; // 1 seconde

      while (retryCount <= maxRetries) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/usersList?${params}`,
            { headers }
          );

          console.log("Status de la réponse:", response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Erreur de réponse:", errorText);

            // Gérer spécifiquement l'erreur 429
            if (response.status === 429) {
              retryCount++;
              if (retryCount <= maxRetries) {
                console.log(
                  `Erreur 429, tentative ${retryCount}/${
                    maxRetries + 1
                  } après ${retryDelay}ms...`
                );
                await new Promise((resolve) =>
                  setTimeout(resolve, retryDelay * retryCount)
                );
                continue; // Réessayer
              } else {
                throw new Error(
                  "Trop de requêtes. Veuillez attendre quelques instants avant de réessayer."
                );
              }
            }

            // Si le token est invalide, le supprimer et rediriger
            if (response.status === 401) {
              console.log("Token invalide, suppression et redirection");
              if (typeof window !== "undefined") {
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");
              }
              router.push("/connexion");
              throw new Error("Token invalide, veuillez vous reconnecter");
            }

            throw new Error(
              `Failed to fetch users: ${response.status} - ${errorText}`
            );
          }

          const data = await response.json();
          console.log("Données reçues:", data);

          if (data.success) {
            setUsers(data.users);
            setAllUsers(data.users); // Stocker tous les utilisateurs pour le filtrage local
            setSubjects(data.subjects || []);
            setTotalPages(data.pagination.pages);
            setTotalUsers(data.pagination.total);
            setError("");
            console.log("Utilisateurs chargés avec succès:", data.users.length);
            return; // Sortir de la boucle en cas de succès
          } else {
            console.error("Erreur dans les données:", data.message);
            setError(data.message || "Error fetching users");
            return;
          }
        } catch (fetchError: any) {
          if (retryCount <= maxRetries && fetchError.message.includes("429")) {
            continue; // Continuer la boucle pour retry
          }
          throw fetchError; // Relancer l'erreur si ce n'est pas 429 ou si maxRetries atteint
        }
      }
    } catch (err: any) {
      console.error(
        "Erreur complète lors du chargement des utilisateurs:",
        err
      );

      // Gérer spécifiquement l'erreur 401 (non autorisé)
      if (
        err.message.includes("401") ||
        err.message.includes("Not authorized") ||
        err.message.includes("Token invalide")
      ) {
        setError("Erreur d'authentification. Veuillez vous reconnecter.");
        // Rediriger vers la page de connexion si nécessaire
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          router.push("/connexion");
        }
      } else if (err.message.includes("Trop de requêtes")) {
        setError(err.message);
      } else {
        setError("Erreur lors du chargement des utilisateurs: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    selectedSubject,
    selectedRole,
    selectedStatus,
    sortBy,
    sortOrder,
    currentPage,
    router,
  ]);

  const fetchStats = async () => {
    try {
      // Récupérer le token pour l'authentification
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        "http://localhost:5000/api/usersList/stats",
        { headers }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
    if (role === "admin") return <Shield className="h-4 w-4 text-red-600" />;
    if (isMonitor) return <Star className="h-4 w-4 text-blue-600" />;
    return <Users className="h-4 w-4 text-gray-600" />;
  };

  // Vérifier si l'utilisateur est un administrateur et charger les données
  useEffect(() => {
    if (!isAuthenticated) {
      setAuthLoading(false);
      return;
    }

    if (user?.role !== "admin") {
      router.push("/"); // Rediriger vers l'accueil si non admin
      return;
    }

    setAuthLoading(false);
    // Charger les données une seule fois
    fetchUsers();
    fetchStats();
  }, [isAuthenticated, user, router]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recharger les données uniquement quand les filtres changent
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin" && !authLoading) {
      fetchUsers();
    }
  }, [
    searchTerm,
    selectedSubject,
    selectedRole,
    selectedStatus,
    sortBy,
    sortOrder,
    currentPage,
    authLoading,
    fetchUsers,
    isAuthenticated,
    user?.role,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // Afficher le chargement pendant la vérification d'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Vérification des autorisations...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Annuaire des Utilisateurs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez tous les membres de notre communauté et leurs domaines
            d&apos;expertise
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Total Utilisateurs
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Administrateurs</p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.admin}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Moniteurs</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.monitors}
                  </p>
                </div>
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Moniteurs Actifs</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.activeMonitors}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg mb-8">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher un utilisateur par nom, email, expertise, bio..."
                className="pl-12 h-14 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {filteredUsers.length} / {totalUsers} utilisateurs
              </span>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Subject Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-12 h-12 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white border appearance-none pr-8"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Toutes les matières</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-12 h-12 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white border appearance-none pr-8"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tous les rôles</option>
                <option value="admin">Admin</option>
                <option value="user">Utilisateur</option>
                <option value="monitor">Moniteur</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-12 h-12 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white border appearance-none pr-8"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="verified">Vérifié</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-12 h-12 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white border appearance-none pr-8"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                  setCurrentPage(1);
                }}
              >
                <option value="createdAt-desc">Plus récents</option>
                <option value="createdAt-asc">Plus anciens</option>
                <option value="name-asc">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
                <option value="email-asc">Email (A-Z)</option>
                <option value="isMonitor-desc">Moniteurs d&apos;abord</option>
                <option value="role-desc">Admin d&apos;abord</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchInput ||
            selectedSubject ||
            selectedRole ||
            selectedStatus) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Filtres actifs:</span>
              {searchInput && (
                <Badge variant="secondary" className="gap-1">
                  &quot;{searchInput}&quot;
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setCurrentPage(1);
                    }}
                    className="ml-1 hover:text-red-600"
                  >
                    &times;
                  </button>
                </Badge>
              )}
              {selectedSubject && (
                <Badge variant="secondary" className="gap-1">
                  {selectedSubject}
                  <button
                    onClick={() => {
                      setSelectedSubject("");
                      setCurrentPage(1);
                    }}
                    className="ml-1 hover:text-red-600"
                  >
                    &times;
                  </button>
                </Badge>
              )}
              {selectedRole && (
                <Badge variant="secondary" className="gap-1">
                  {selectedRole}
                  <button
                    onClick={() => {
                      setSelectedRole("");
                      setCurrentPage(1);
                    }}
                    className="ml-1 hover:text-red-600"
                  >
                    &times;
                  </button>
                </Badge>
              )}
              {selectedStatus && (
                <Badge variant="secondary" className="gap-1">
                  {selectedStatus}
                  <button
                    onClick={() => {
                      setSelectedStatus("");
                      setCurrentPage(1);
                    }}
                    className="ml-1 hover:text-red-600"
                  >
                    &times;
                  </button>
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  setSelectedSubject("");
                  setSelectedRole("");
                  setSelectedStatus("");
                  setCurrentPage(1);
                }}
                className="border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              >
                Effacer tous les filtres
              </Button>
            </div>
          )}
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Chargement des utilisateurs...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{error}</h3>
              <Button
                onClick={fetchUsers}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Réessayer
              </Button>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchInput
                ? "Aucun utilisateur trouvé"
                : "Aucun utilisateur dans la base de données"}
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              {searchInput
                ? "Aucun utilisateur ne correspond à votre recherche."
                : "Aucun utilisateur n'est encore enregistré."}
            </p>
            {searchInput && (
              <Button
                variant="outline"
                onClick={() => setSearchInput("")}
                className="border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              >
                Effacer la recherche
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredUsers.map((user) => (
                <Link key={user._id} href={`/users/${user._id}`}>
                  <div className="group bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                    {/* Header */}
                    <div className="relative h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600">
                      <div className="absolute top-3 right-3">
                        {getRoleBadge(user.role, user.isMonitor)}
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                          {getRoleIcon(user.role, user.isMonitor)}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {user.name || user.username}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 truncate">
                          {user.email}
                        </span>
                      </div>

                      {/* Bio */}
                      {user.bio && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {user.bio}
                        </p>
                      )}

                      {/* Expertise */}
                      {user.monitorProfile?.expertise &&
                        user.monitorProfile.expertise.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Expertise:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {user.monitorProfile.expertise
                                .slice(0, 2)
                                .map((expertise, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {expertise}
                                  </Badge>
                                ))}
                              {user.monitorProfile.expertise.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{user.monitorProfile.expertise.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <BookOpen className="h-3 w-3" />
                          <span>
                            {user.monitorProfile?.coursesCreated || 0} cours
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>Depuis {formatDate(user.createdAt)}</span>
                        </div>
                      </div>

                      {/* Status indicators */}
                      <div className="flex items-center gap-2 mt-3">
                        {user.isActive ? (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600">
                              Actif
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-xs text-gray-600">
                              Inactif
                            </span>
                          </div>
                        )}
                        {user.emailVerified && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-blue-600">
                              Vérifié
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                >
                  Précédent
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 ${
                          currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
