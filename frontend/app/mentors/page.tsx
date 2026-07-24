"use client";

import { useState, useEffect } from "react";
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
  Star,
  BookOpen,
  Loader2,
  UserCheck,
  Award,
  MapPin,
  Globe,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

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

  useEffect(() => {
    fetchMentors();
  }, [
    searchQuery,
    selectedSubject,
    selectedRating,
    selectedExperience,
    currentPage,
  ]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        role: "monitor", // Filtrer uniquement les moniteurs
        sortBy: "monitorProfile.rating",
        sortOrder: "desc",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (selectedSubject) params.append("subject", selectedSubject);
      if (selectedRating) params.append("rating", selectedRating);
      if (selectedExperience) params.append("experience", selectedExperience);

      // Récupérer le token depuis localStorage si disponible
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
        `http://localhost:5000/api/usersList?${params}`,
        { headers }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Si non authentifié, essayer sans authentification pour les mentors publics
          const publicResponse = await fetch(
            `http://localhost:5000/api/usersList/public?${params}`,
            { headers: { "Content-Type": "application/json" } }
          );

          if (!publicResponse.ok) {
            throw new Error("Failed to fetch mentors");
          }

          const data = await publicResponse.json();

          if (data.success) {
            setMentors(data.users);
            setSubjects(data.subjects || []);
            setTotalPages(data.pagination.pages);
            setTotalMentors(data.pagination.total);
            setError("");
          } else {
            setError(data.message || "Error fetching mentors");
          }
          return;
        }
        throw new Error("Failed to fetch mentors");
      }

      const data = await response.json();

      if (data.success) {
        setMentors(data.users);
        setSubjects(data.subjects || []);
        setTotalPages(data.pagination.pages);
        setTotalMentors(data.pagination.total);
        setError("");
      } else {
        setError(data.message || "Error fetching mentors");
      }
    } catch (err) {
      console.error("Error fetching mentors:", err);
      setError("Erreur lors du chargement des mentors");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Trouver un Mentor
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connectez-vous avec des experts passionnés pour vous guider dans
            votre parcours d&apos;apprentissage
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg mb-8">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher un mentor par nom, expertise, bio..."
                className="pl-12 h-14 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Subject Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-12 h-12 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white border appearance-none pr-8 w-full"
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

            {/* Rating Filter */}
            <div className="relative">
              <Star className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-12 h-12 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white border appearance-none pr-8 w-full"
                value={selectedRating}
                onChange={(e) => {
                  setSelectedRating(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Toutes les notes</option>
                <option value="5">5 étoiles</option>
                <option value="4">4 étoiles et plus</option>
                <option value="3">3 étoiles et plus</option>
                <option value="2">2 étoiles et plus</option>
              </select>
            </div>

            {/* Experience Filter */}
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-12 h-12 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white border appearance-none pr-8 w-full"
                value={selectedExperience}
                onChange={(e) => {
                  setSelectedExperience(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Toutes expériences</option>
                <option value="senior">Mentors expérimentés</option>
                <option value="intermediate">Mentors intermédiaires</option>
                <option value="beginner">Mentors débutants</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery ||
            selectedSubject ||
            selectedRating ||
            selectedExperience) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Filtres actifs:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  &quot;{searchQuery}&quot;
                  <button
                    onClick={() => {
                      setSearchQuery("");
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
              {selectedRating && (
                <Badge variant="secondary" className="gap-1">
                  {selectedRating === "5"
                    ? "5 étoiles"
                    : selectedRating === "4"
                    ? "4+ étoiles"
                    : selectedRating === "3"
                    ? "3+ étoiles"
                    : "2+ étoiles"}
                  <button
                    onClick={() => {
                      setSelectedRating("");
                      setCurrentPage(1);
                    }}
                    className="ml-1 hover:text-red-600"
                  >
                    &times;
                  </button>
                </Badge>
              )}
              {selectedExperience && (
                <Badge variant="secondary" className="gap-1">
                  {selectedExperience === "senior"
                    ? "Expérimentés"
                    : selectedExperience === "intermediate"
                    ? "Intermédiaires"
                    : "Débutants"}
                  <button
                    onClick={() => {
                      setSelectedExperience("");
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
                  setSearchQuery("");
                  setSelectedSubject("");
                  setSelectedRating("");
                  setSelectedExperience("");
                  setCurrentPage(1);
                }}
                className="border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              >
                Effacer les filtres
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            {totalMentors} mentor{totalMentors > 1 ? "s" : ""} disponible
            {totalMentors > 1 ? "s" : ""}
          </p>
        </div>

        {/* Mentors Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Chargement des mentors...</p>
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
                onClick={fetchMentors}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Réessayer
              </Button>
            </div>
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Aucun mentor trouvé
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              {searchQuery || selectedSubject
                ? "Aucun mentor ne correspond à vos critères de recherche."
                : "Aucun mentor n'est encore disponible."}
            </p>
            {(searchQuery || selectedSubject) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSubject("");
                  setCurrentPage(1);
                }}
                className="border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              >
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {mentors.map((mentor) => (
                <Link key={mentor._id} href={`/users/${mentor._id}`}>
                  <div className="group bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                    {/* Header */}
                    <div className="relative h-40 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600">
                      <div className="absolute top-4 right-4">
                        {mentor.monitorProfile?.verified && (
                          <Badge className="bg-green-100 text-green-800">
                            <Award className="h-3 w-3 mr-1" />
                            Vérifié
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                          <Star className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {mentor.name || mentor.username}
                      </h3>

                      {/* Rating */}
                      {mentor.monitorProfile?.rating && (
                        <div className="flex items-center gap-1 mb-3">
                          {getRatingStars(mentor.monitorProfile.rating)}
                          <span className="text-sm text-gray-600 ml-1">
                            ({mentor.monitorProfile.rating})
                          </span>
                        </div>
                      )}

                      {/* Bio */}
                      {mentor.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {mentor.bio}
                        </p>
                      )}

                      {/* Expertise */}
                      {mentor.monitorProfile?.expertise &&
                        mentor.monitorProfile.expertise.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Expertise:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {mentor.monitorProfile.expertise
                                .slice(0, 3)
                                .map((expertise, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {typeof expertise.subject === "object"
                                      ? expertise.subject.name
                                      : expertise.subject}
                                  </Badge>
                                ))}
                              {mentor.monitorProfile.expertise.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{mentor.monitorProfile.expertise.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <BookOpen className="h-3 w-3" />
                          <span>
                            {mentor.monitorProfile?.coursesCreated || 0} cours
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>Depuis {formatDate(mentor.createdAt)}</span>
                        </div>
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
