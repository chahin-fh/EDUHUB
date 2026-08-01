"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Sparkles,
  X,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, AnimatedSection, StaggerContainer, StaggerItem, AnimatedCard } from "@/components/animated-section";
import { getExpertiseLabel, type ExpertiseItem } from "@/lib/utils";

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "user";
  isMonitor: boolean;
  monitorProfile?: {
    expertise: ExpertiseItem[];
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

const statsConfig = [
  { key: "total", label: "Total Utilisateurs", icon: Users, color: "from-blue-500 to-blue-600", textColor: "text-blue-600" },
  { key: "admin", label: "Administrateurs", icon: Shield, color: "from-red-500 to-red-600", textColor: "text-red-600" },
  { key: "monitors", label: "Moniteurs", icon: Star, color: "from-purple-500 to-purple-600", textColor: "text-purple-600" },
  { key: "activeMonitors", label: "Moniteurs Actifs", icon: UserCheck, color: "from-green-500 to-green-600", textColor: "text-green-600" },
];

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
  const [searchInput, setSearchInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Evite le double-fetch initial (React StrictMode execute les effets 2x en dev)
  const didInit = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const searchLower = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(searchLower) ||
        u.username?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        u.monitorProfile?.expertise?.some((exp) =>
          getExpertiseLabel(exp).toLowerCase().includes(searchLower)
        ) ||
        u.bio?.toLowerCase().includes(searchLower)
    );
  }, [users, searchTerm]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (!token) { setError("Veuillez vous connecter"); router.push("/connexion"); return; }

      const params = new URLSearchParams({ page: currentPage.toString(), limit: "50", sortBy, sortOrder });
      if (searchTerm) params.append("search", searchTerm);
      if (selectedSubject) params.append("subject", selectedSubject);
      if (selectedRole) params.append("role", selectedRole);
      if (selectedStatus) params.append("status", selectedStatus);

      // Pas de boucle de retry sur 429 : chaque nouvelle requête compte aussi dans le
      // rate-limiter et aggrave le problème. On affiche simplement le message d'erreur.
      const response = await fetch(`http://localhost:5000/api/usersList?${params}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "Trop de requêtes. Veuillez patienter quelques minutes avant de réessayer."
          );
        }
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          router.push("/connexion");
          throw new Error("Token invalide");
        }
        throw new Error(`Erreur: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setAllUsers(data.users);
        setSubjects(data.subjects || []);
        setTotalPages(data.pagination.pages);
        setTotalUsers(data.pagination.total);
        setError("");
        return;
      } else {
        setError(data.message || "Erreur");
        return;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedSubject, selectedRole, selectedStatus, sortBy, sortOrder, currentPage, router]);

  const fetchStats = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch("http://localhost:5000/api/usersList/stats", { headers });
      if (response.ok) {
        const data = await response.json();
        if (data.success) setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

  const getRoleBadge = (role: string, isMonitor: boolean) => {
    if (role === "admin") return <Badge className="bg-red-100 text-red-800 border-red-200">Admin</Badge>;
    if (isMonitor) return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Moniteur</Badge>;
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Utilisateur</Badge>;
  };

  const getRoleIcon = (role: string, isMonitor: boolean) => {
    if (role === "admin") return <Shield className="h-4 w-4 text-red-600" />;
    if (isMonitor) return <Star className="h-4 w-4 text-blue-600" />;
    return <Users className="h-4 w-4 text-gray-600" />;
  };

  useEffect(() => {
    if (!isAuthenticated) { setAuthLoading(false); return; }
    if (user?.role !== "admin") { router.push("/"); return; }
    // Ne s'exécute qu'une seule fois (StrictMode en dev exécute les effets 2x)
    if (!didInit.current) {
      didInit.current = true;
      setAuthLoading(false);
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, router]);

  // Chargement initial des utilisateurs (une seule fois, après l'auth)
  useEffect(() => {
    if (
      didInit.current &&
      !authLoading &&
      isAuthenticated &&
      user?.role === "admin"
    ) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // Refetch à chaque changement de filtre / pagination / tri
  useEffect(() => {
    if (
      didInit.current &&
      !authLoading &&
      isAuthenticated &&
      user?.role === "admin"
    ) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedSubject, selectedRole, selectedStatus, sortBy, sortOrder, currentPage]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Vérification des autorisations...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <AnimatedSection className="text-center mb-10">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4"
            >
              <Sparkles className="w-4 h-4" />
              Administration
            </motion.span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Annuaire des Utilisateurs
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              D&eacute;couvrez tous les membres de notre communaut&eacute; et leurs domaines d&apos;expertise
            </p>
          </AnimatedSection>

          {/* Stats Cards */}
          {stats && (
            <AnimatedSection delay={0.1} className="mb-10">
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsConfig.map(({ key, label, icon: Icon, color, textColor }) => (
                  <StaggerItem key={key}>
                    <motion.div whileHover={{ y: -4, scale: 1.02 }}>
                      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">{label}</p>
                              <p className={`text-3xl font-bold ${textColor}`}>
                                {stats[key as keyof UserStats]}
                              </p>
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className={`p-3 rounded-xl bg-gradient-to-br ${color}`}
                            >
                              <Icon className="h-6 w-6 text-white" />
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </AnimatedSection>
          )}

          {/* Search & Filters */}
          <AnimatedSection delay={0.2}>
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-6 shadow-lg mb-8">
              {/* Search */}
              <div className="flex flex-col lg:flex-row gap-4 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Rechercher un utilisateur par nom, email, expertise..."
                    className="pl-12 h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  {searchInput && (
                    <button
                      onClick={() => setSearchInput("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">{filteredUsers.length}</span> / {totalUsers} utilisateurs
                  </span>
                </div>
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    icon: Filter, value: selectedSubject, setter: setSelectedSubject,
                    options: [{ value: "", label: "Toutes les matières" }, ...subjects.map((s) => ({ value: s, label: s }))],
                    placeholder: "Matière",
                  },
                  {
                    icon: Shield, value: selectedRole, setter: setSelectedRole,
                    options: [
                      { value: "", label: "Tous les rôles" },
                      { value: "admin", label: "Admin" },
                      { value: "user", label: "Utilisateur" },
                      { value: "monitor", label: "Moniteur" },
                    ],
                    placeholder: "Rôle",
                  },
                  {
                    icon: UserCheck, value: selectedStatus, setter: setSelectedStatus,
                    options: [
                      { value: "", label: "Tous les statuts" },
                      { value: "active", label: "Actif" },
                      { value: "inactive", label: "Inactif" },
                      { value: "verified", label: "Vérifié" },
                    ],
                    placeholder: "Statut",
                  },
                  {
                    icon: TrendingUp, value: `${sortBy}-${sortOrder}`, setter: (v: string) => {
                      const [field, order] = v.split("-");
                      setSortBy(field);
                      setSortOrder(order);
                      setCurrentPage(1);
                    },
                    options: [
                      { value: "createdAt-desc", label: "Plus récents" },
                      { value: "createdAt-asc", label: "Plus anciens" },
                      { value: "name-asc", label: "Nom (A-Z)" },
                      { value: "name-desc", label: "Nom (Z-A)" },
                      { value: "isMonitor-desc", label: "Moniteurs d'abord" },
                      { value: "role-desc", label: "Admin d'abord" },
                    ],
                    placeholder: "Trier par",
                  },
                ].map((filter, idx) => (
                  <div key={idx} className="relative">
                    <filter.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      className="pl-12 h-12 w-full text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white border appearance-none pr-8 cursor-pointer hover:border-blue-300 transition-colors"
                      value={filter.value}
                      onChange={(e) => { filter.setter(e.target.value); setCurrentPage(1); }}
                    >
                      {filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Active Filters */}
              {(searchInput || selectedSubject || selectedRole || selectedStatus) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Filtres actifs :</span>
                  {[
                    { show: !!searchInput, label: `"${searchInput}"`, clear: () => { setSearchInput(""); setCurrentPage(1); } },
                    { show: !!selectedSubject, label: selectedSubject, clear: () => { setSelectedSubject(""); setCurrentPage(1); } },
                    { show: !!selectedRole, label: selectedRole, clear: () => { setSelectedRole(""); setCurrentPage(1); } },
                    { show: !!selectedStatus, label: selectedStatus, clear: () => { setSelectedStatus(""); setCurrentPage(1); } },
                  ].filter((f) => f.show).map((f, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1 px-3 py-1.5">
                      {f.label}
                      <button onClick={f.clear} className="ml-1 hover:text-red-500 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Button
                    variant="outline" size="sm"
                    onClick={() => { setSearchInput(""); setSelectedSubject(""); setSelectedRole(""); setSelectedStatus(""); setCurrentPage(1); }}
                    className="border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs"
                  >
                    Effacer tous les filtres
                  </Button>
                </motion.div>
              )}
            </div>
          </AnimatedSection>

          {/* Users Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Chargement des utilisateurs...</p>
              </motion.div>
            </div>
          ) : error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl p-8 shadow-lg max-w-xl mx-auto text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{error}</h3>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={fetchUsers} className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  Réessayer
                </Button>
              </motion.div>
            </motion.div>
          ) : filteredUsers.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {searchInput ? "Aucun utilisateur trouvé" : "Aucun utilisateur"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchInput ? "Aucun résultat ne correspond à votre recherche." : "Aucun utilisateur n'est encore enregistré."}
              </p>
              {searchInput && (
                <Button variant="outline" onClick={() => setSearchInput("")} className="rounded-xl border-gray-200">
                  Effacer la recherche
                </Button>
              )}
            </motion.div>
          ) : (
            <>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {filteredUsers.map((u) => (
                  <StaggerItem key={u._id}>
                    <Link href={`/users/${u._id}`}>
                      <motion.div
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="group bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full"
                      >
                        {/* Header gradient */}
                        <div className="relative h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 overflow-hidden">
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
                          <div className="absolute top-3 right-3 z-10">{getRoleBadge(u.role, u.isMonitor)}</div>
                          <div className="absolute -bottom-6 left-5">
                            <motion.div whileHover={{ scale: 1.15 }} className="w-14 h-14 rounded-xl bg-white shadow-lg flex items-center justify-center border-2 border-white">
                              {getRoleIcon(u.role, u.isMonitor)}
                            </motion.div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 pt-10">
                          <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                            {u.name || u.username}
                          </h3>

                          <div className="flex items-center gap-2 mb-2">
                            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-500 truncate">{u.email}</span>
                          </div>

                          {u.bio && (
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{u.bio}</p>
                          )}

                          {u.monitorProfile?.expertise && u.monitorProfile.expertise.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {u.monitorProfile.expertise.slice(0, 2).map((exp, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    {getExpertiseLabel(exp)}
                                  </Badge>
                                ))}
                                {u.monitorProfile.expertise.length > 2 && (
                                  <Badge variant="secondary" className="text-xs bg-gray-50">
                                    +{u.monitorProfile.expertise.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <BookOpen className="h-3 w-3" />
                              <span>{u.monitorProfile?.coursesCreated || 0} cours</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(u.createdAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${u.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                              <span className={`text-xs ${u.isActive ? "text-green-600" : "text-gray-400"}`}>
                                {u.isActive ? "Actif" : "Inactif"}
                              </span>
                            </div>
                            {u.emailVerified && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-xs text-blue-600">Vérifié</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center gap-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl"
                    >
                      Précédent
                    </Button>
                  </motion.div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <motion.div key={page} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-xl ${
                              currentPage === page
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            {page}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl"
                    >
                      Suivant
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
