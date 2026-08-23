"use client";

import { API_BASE } from "@/lib/api-config";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Users,
  Calendar,
  Star,
  BookOpen,
  Loader2,
  Award,
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
  X,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatedSection, StaggerContainer, StaggerItem, AnimatedCard, PageTransition } from "@/components/animated-section";

interface SubjectInfo {
  _id: string;
  name: string;
  slug: string;
}

interface Mentor {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "user";
  isMonitor: boolean;
  monitorProfile?: {
    expertise: Array<{ subject: SubjectInfo | string; level: string; verified: boolean }>;
    verified: boolean;
    rating: number;
    coursesCreated: number;
    ratingsCount: number;
  };
  avatar?: string;
  bio?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  emailVerified: boolean;
}

function MentorCard({ mentor }: { mentor: Mentor }) {
  const getRatingStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`h-4 w-4 ${i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
    ));
  };

  return (
    <StaggerItem>
      <AnimatedCard>
        <Link href={`/users/${mentor._id}`}>
          <div className="group bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer">
            <div className="relative h-40 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
              <div className="absolute top-4 right-4 flex gap-2">
                {mentor.monitorProfile?.verified && (
                  <Badge className="bg-green-100 text-green-800 border-green-200 shadow-sm">
                    <Award className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
                {(mentor.monitorProfile?.rating ?? 0) >= 4.5 && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 shadow-sm animate-gentle-bounce">
                    <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                    Top
                  </Badge>
                )}
              </div>
              <div className="absolute bottom-4 left-4">
                <motion.div
                  className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Star className="h-6 w-6 text-blue-600" />
                </motion.div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {mentor.name || mentor.username}
              </h3>

              {mentor.monitorProfile?.rating && (
                <div className="flex items-center gap-1 mb-3">
                  {getRatingStars(mentor.monitorProfile.rating)}
                  <span className="text-sm text-gray-500 ml-1">
                    ({mentor.monitorProfile.rating.toFixed(1)})
                  </span>
                </div>
              )}

              {mentor.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{mentor.bio}</p>
              )}

              {mentor.monitorProfile?.expertise && mentor.monitorProfile.expertise.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Expertise</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.monitorProfile.expertise.slice(0, 3).map((exp, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-100">
                        {typeof exp.subject === "object" ? exp.subject.name : exp.subject}
                      </Badge>
                    ))}
                    {mentor.monitorProfile.expertise.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gray-50">
                        +{mentor.monitorProfile.expertise.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <BookOpen className="h-3 w-3" />
                  <span>{mentor.monitorProfile?.coursesCreated || 0} cours</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(mentor.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "short" })}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </AnimatedCard>
    </StaggerItem>
  );
}

export default function MentorsPage() {
  const { user, isAuthenticated } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMentors, setTotalMentors] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchMentors = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(), limit: "12",
        role: "monitor", sortBy: "monitorProfile.rating", sortOrder: "desc",
      });
      if (searchQuery) params.append("search", searchQuery);
      if (selectedSubject) params.append("subject", selectedSubject);
      if (selectedRating) params.append("rating", selectedRating);
      if (selectedExperience) params.append("experience", selectedExperience);

      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let response = await fetch(`${API_BASE}/api/usersList?${params}`, { headers });

      // La route privée /api/usersList est désormais admin-only (403 pour un
      // étudiant/moniteur) : on bascule sur l'endpoint public /public.
      if (response.status === 401 || response.status === 403) {
        response = await fetch(`${API_BASE}/api/usersList/public?${params}`, { headers: { "Content-Type": "application/json" } });
      }

      const data = await response.json();
      if (data.success) {
        setMentors(data.users); setSubjects(data.subjects || []);
        setTotalPages(data.pagination.pages); setTotalMentors(data.pagination.total);
        setError("");
      } else setError(data.message || "Error");
    } catch (err) {
      setError("Erreur lors du chargement des mentors");
    } finally { setLoading(false); }
  }, [searchQuery, selectedSubject, selectedRating, selectedExperience, currentPage]);

  useEffect(() => {
    fetchMentors();
  }, [searchQuery, selectedSubject, selectedRating, selectedExperience, currentPage, fetchMentors]);

  const clearFilters = () => {
    setSearchQuery(""); setSelectedSubject(""); setSelectedRating("");
    setSelectedExperience(""); setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedSubject || selectedRating || selectedExperience;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <AnimatedSection className="text-center mb-12">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" /> Communauté de mentors
            </motion.span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Trouver un Mentor
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connectez-vous avec des étudiants passionnés pour vous guider dans votre parcours
            </p>
          </AnimatedSection>

          {/* Search and Filters */}
          <AnimatedSection delay={0.2}>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input placeholder="Rechercher un mentor..." className="pl-12 h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl" value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                </div>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-14 px-6 border-gray-200 rounded-xl gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Filtres
                  </Button>
                </motion.div>
              </div>

              <motion.div animate={{ height: showFilters ? "auto" : 0, opacity: showFilters ? 1 : 0 }}
                transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select className="pl-10 h-12 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white border appearance-none pr-8 w-full cursor-pointer"
                      value={selectedSubject} onChange={(e) => { setSelectedSubject(e.target.value); setCurrentPage(1); }}>
                      <option value="">Toutes les matières</option>
                      {subjects.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                  <div className="relative">
                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select className="pl-10 h-12 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white border appearance-none pr-8 w-full cursor-pointer"
                      value={selectedRating} onChange={(e) => { setSelectedRating(e.target.value); setCurrentPage(1); }}>
                      <option value="">Toutes les notes</option>
                      <option value="5">5 étoiles</option>
                      <option value="4">4 étoiles et plus</option>
                      <option value="3">3 étoiles et plus</option>
                    </select>
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select className="pl-10 h-12 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white border appearance-none pr-8 w-full cursor-pointer"
                      value={selectedExperience} onChange={(e) => { setSelectedExperience(e.target.value); setCurrentPage(1); }}>
                      <option value="">Toutes expériences</option>
                      <option value="senior">Mentors expérimentés</option>
                      <option value="intermediate">Intermédiaires</option>
                      <option value="beginner">Débutants</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {hasActiveFilters && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-500">Filtres actifs :</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1 py-1.5">
                      &ldquo;{searchQuery}&rdquo;
                      <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </Badge>
                  )}
                  {selectedSubject && (
                    <Badge variant="secondary" className="gap-1 py-1.5">
                      {selectedSubject}
                      <button onClick={() => setSelectedSubject("")} className="ml-1 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </Badge>
                  )}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" size="sm" onClick={clearFilters} className="border-gray-200 text-gray-500 hover:text-blue-600 rounded-lg">
                      Effacer tout
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </AnimatedSection>

          {/* Results */}
          <AnimatedSection delay={0.3}>
            {totalMentors > 0 && (
              <div className="mb-6 text-center">
                <p className="text-gray-600"><span className="font-semibold text-gray-900">{totalMentors}</span> mentor{totalMentors > 1 ? "s" : ""} disponible{totalMentors > 1 ? "s" : ""}</p>
              </div>
            )}
          </AnimatedSection>

          {loading ? (
            <div className="flex justify-center py-20">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Chargement des mentors...</p>
              </motion.div>
            </div>
          ) : error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/80 rounded-2xl p-8 shadow-lg max-w-lg mx-auto text-center border border-red-100">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">{error}</p>
              <Button onClick={fetchMentors} className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">Réessayer</Button>
            </motion.div>
          ) : mentors.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white/50 rounded-2xl border border-dashed border-gray-200">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun mentor trouvé</h3>
              <p className="text-gray-500 mb-6">{searchQuery || selectedSubject ? "Aucun mentor ne correspond à vos critères" : "Aucun mentor disponible pour le moment"}</p>
              {hasActiveFilters && <Button variant="outline" onClick={clearFilters} className="rounded-xl">Effacer les filtres</Button>}
            </motion.div>
          ) : (
            <>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {mentors.map((mentor) => (<MentorCard key={mentor._id} mentor={mentor} />))}
              </StaggerContainer>

              {totalPages > 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center gap-2">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="border-gray-200 rounded-xl">
                      Précédent
                    </Button>
                  </motion.div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <motion.div key={page} whileTap={{ scale: 0.9 }}>
                          <Button variant={currentPage === page ? "default" : "outline"} onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-xl ${currentPage === page ? "bg-gradient-to-r from-blue-600 to-purple-600" : "border-gray-200"}`}>
                            {page}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="border-gray-200 rounded-xl">
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
