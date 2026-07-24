"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Star,
  BookOpen,
  Loader2,
  MessageSquare,
  Users,
  GraduationCap,
  AlertCircle,
  Filter,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Subject {
  _id: string;
  name: string;
  slug: string;
  category: string;
  mentorCount: number;
}

interface UserMentor {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  monitorProfile: {
    expertise: Array<{
      subject: { _id: string; name: string; slug: string };
      level: string;
      verified: boolean;
    }>;
    rating: number;
    ratingsCount: number;
    verified: boolean;
  };
}

export default function ApprendrePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mentors, setMentors] = useState<UserMentor[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/matching/subjects");
      const data = await res.json();
      if (data.success) {
        setSubjects(data.subjects);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = async (subjectId: string, subjectName: string) => {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }

    setSelectedSubject(subjectId);
    setSelectedSubjectName(subjectName);
    setSearching(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      const params = new URLSearchParams({ subject: subjectId });
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(
        `http://localhost:5000/api/matching/find?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 401) {
        router.push("/connexion");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setMentors(data.mentors);
      } else {
        setError(data.message || "Erreur lors de la recherche");
      }
    } catch (err) {
      console.error("Error searching:", err);
      setError("Erreur lors de la recherche de mentors");
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (mentorId: string) => {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/matching/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mentorId,
          subjectId: selectedSubject,
          message: `Bonjour, j'aimerais apprendre ${selectedSubjectName} avec vous !`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Demande envoyée avec succès !");
      } else {
        alert(data.message || "Erreur lors de l'envoi de la demande");
      }
    } catch (err) {
      console.error("Error sending request:", err);
      alert("Erreur lors de l'envoi de la demande");
    }
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= Math.round(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const clearFilters = () => {
    setSelectedSubject("");
    setSelectedSubjectName("");
    setMentors([]);
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
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
            Apprendre entre étudiants
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trouvez un étudiant qui maîtrise la matière que vous voulez apprendre
          </p>
        </div>

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher une matière..."
                className="pl-12 h-14 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Subjects Grid */}
          {!selectedSubject && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
                Choisissez une matière :
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {subjects.map((subject) => (
                  <button
                    key={subject._id}
                    onClick={() =>
                      handleSubjectSelect(subject._id, subject.name)
                    }
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-center group"
                  >
                    <GraduationCap className="h-6 w-6 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
                    <p className="font-medium text-gray-900 text-sm">
                      {subject.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {subject.mentorCount} mentor{subject.mentorCount > 1 ? "s" : ""}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Active filters */}
          {selectedSubject && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Matière :</span>
              <Badge variant="secondary" className="gap-1">
                {selectedSubjectName}
                <button onClick={clearFilters} className="ml-1 hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>

        {/* Results */}
        {searching ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
          </div>
        ) : mentors.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                {mentors.length} étudiant{mentors.length > 1 ? "s" : ""} trouvé
                {mentors.length > 1 ? "s" : ""} pour {selectedSubjectName}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <Card
                  key={mentor._id}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200 hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-14 w-14 ring-2 ring-blue-100">
                        <AvatarImage src={mentor.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {(mentor.name || mentor.username || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => router.push(`/users/${mentor._id}`)}
                        >
                          {mentor.name || mentor.username}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          {getRatingStars(mentor.monitorProfile?.rating || 0)}
                          <span className="text-xs text-gray-500 ml-1">
                            ({mentor.monitorProfile?.ratingsCount || 0})
                          </span>
                        </div>
                      </div>
                    </div>

                    {mentor.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {mentor.bio}
                      </p>
                    )}

                    {/* Expertise for this subject */}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        Niveau en {selectedSubjectName} :
                      </p>
                      {mentor.monitorProfile?.expertise
                        ?.filter(
                          (e) =>
                            typeof e.subject === "object" &&
                            e.subject._id === selectedSubject
                        )
                        .map((exp, idx) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-800 border-blue-200">
                            {exp.level}
                          </Badge>
                        ))}
                    </div>

                    {/* Other expertise */}
                    {mentor.monitorProfile?.expertise &&
                      mentor.monitorProfile.expertise.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 mb-2">
            Autres matières maîtrisées :
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {mentor.monitorProfile.expertise
                              .filter(
                                (e) =>
                                  typeof e.subject === "object" &&
                                  e.subject._id !== selectedSubject
                              )
                              .slice(0, 3)
                              .map((exp, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {typeof exp.subject === "object"
                                    ? exp.subject.name
                                    : exp.subject}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}

                    <Button
                      onClick={() => handleSendRequest(mentor._id)}
                      className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Demander une session
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : selectedSubject ? (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun étudiant trouvé
            </h3>
            <p className="text-gray-500">
              Aucun étudiant ne propose {selectedSubjectName} pour le moment
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
