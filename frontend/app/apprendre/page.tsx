"use client";

import { API_BASE } from "@/lib/api-config";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
  Sparkles,
  ArrowRight,
  // Lock, // ⚠️ Paiement commenté
  // CreditCard, // ⚠️ Paiement commenté
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
// ⚠️ Paiement commenté :
// import { useCanContactMonitors } from "@/hooks/use-active-enrollment";
// import PaymentDialog from "@/components/payment-dialog";
import { AnimatedSection, StaggerContainer, StaggerItem, AnimatedCard } from "@/components/animated-section";
import { toast } from "sonner";

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
  // const { canContactMonitors } = useCanContactMonitors(); // ⚠️ Paiement commenté
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mentors, setMentors] = useState<UserMentor[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  // const [paymentOpen, setPaymentOpen] = useState(false); // ⚠️ Paiement commenté

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/matching/subjects`);
      const data = await res.json();
      if (data.success) setSubjects(data.subjects);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = async (subjectId: string, subjectName: string) => {
    if (!isAuthenticated) { router.push("/connexion"); return; }
    setSelectedSubject(subjectId);
    setSelectedSubjectName(subjectName);
    setSearching(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      const params = new URLSearchParams({ subject: subjectId });
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`${API_BASE}/api/matching/find?${params}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (res.status === 401) { router.push("/connexion"); return; }

      const data = await res.json();
      if (data.success) setMentors(data.mentors);
      else setError(data.message || "Erreur lors de la recherche");
    } catch (err) {
      setError("Erreur lors de la recherche de mentors");
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (mentorId: string) => {
    if (!isAuthenticated) { router.push("/connexion"); return; }
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/matching/request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, subjectId: selectedSubject, message: `Bonjour, j'aimerais apprendre ${selectedSubjectName} avec vous !` }),
      });
      const data = await res.json();
      if (data.success) toast.success("Demande envoyée avec succès !");
      else toast.error(data.message || "Erreur");
    } catch (err) {
      toast.error("Erreur lors de l'envoi de la demande");
    }
  };

  const getRatingStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`h-4 w-4 ${i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Chargement des matières...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Matching pair-à-pair
          </motion.span>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Apprendre entre étudiants
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trouvez un étudiant qui maîtrise la matière que vous voulez apprendre
          </p>
        </AnimatedSection>

        {/* Search */}
        <AnimatedSection delay={0.2}>
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Rechercher une matière..."
                  className="pl-12 h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!selectedSubject ? (
                <motion.div
                  key="subjects-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
                    Choisissez une matière :
                  </h3>
                  <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {subjects.map((subject) => (
                      <StaggerItem key={subject._id}>
                        <motion.button
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSubjectSelect(subject._id, subject.name)}
                          className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-center group"
                        >
                          <GraduationCap className="h-6 w-6 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
                          <p className="font-medium text-gray-900 text-sm">{subject.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {subject.mentorCount} mentor{subject.mentorCount > 1 ? "s" : ""}
                          </p>
                        </motion.button>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </motion.div>
              ) : (
                <motion.div
                  key="active-filter"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <span className="text-sm text-gray-500">Matière :</span>
                  <Badge variant="secondary" className="gap-1 px-3 py-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {selectedSubjectName}
                    <button onClick={() => { setSelectedSubject(""); setSelectedSubjectName(""); setMentors([]); }} className="ml-1 hover:text-red-500 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </AnimatedSection>

        {/* Results */}
        <AnimatePresence mode="wait">
          {searching ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-12 bg-white/50 rounded-2xl border border-red-100">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-600">{error}</p>
            </motion.div>
          ) : mentors.length > 0 ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{mentors.length}</span> étudiant{mentors.length > 1 ? "s" : ""} trouvé{mentors.length > 1 ? "s" : ""} pour <Badge variant="secondary">{selectedSubjectName}</Badge>
                </p>
              </div>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map((mentor) => (
                  <StaggerItem key={mentor._id}>
                    <AnimatedCard className="h-full">
                      <Card className="h-full bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex items-start gap-4 mb-4">
                            <motion.div whileHover={{ scale: 1.1 }} className="flex-shrink-0">
                              <Avatar className="h-14 w-14 ring-2 ring-blue-100">
                                <AvatarImage src={mentor.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg">
                                  {(mentor.name || mentor.username || "U").charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => router.push(`/users/${mentor._id}`)}>
                                {mentor.name || mentor.username}
                              </h3>
                              <div className="flex items-center gap-1 mt-1">
                                {getRatingStars(mentor.monitorProfile?.rating || 0)}
                                <span className="text-xs text-gray-400 ml-1">
                                  ({mentor.monitorProfile?.ratingsCount || 0})
                                </span>
                              </div>
                            </div>
                          </div>

                          {mentor.bio && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{mentor.bio}</p>
                          )}

                          {mentor.monitorProfile?.expertise?.filter(e => typeof e.subject === "object" && e.subject._id === selectedSubject).map((exp, idx) => (
                            <div key={idx} className="mb-4">
                              <p className="text-xs font-medium text-gray-500 mb-2">Niveau en {selectedSubjectName} :</p>
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">{exp.level}</Badge>
                            </div>
                          ))}

                          <div className="mt-auto pt-4">
                            {/* ⚠️ Paiement commenté : plus de restriction,
                                le bouton « Demander une session » est toujours affiché */}
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                onClick={() => handleSendRequest(mentor._id)}
                                className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl h-12"
                              >
                                <MessageSquare className="h-4 w-4" />
                                Demander une session
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </motion.div>
                            {/* Ancien bloc (restriction paiement) commenté :
                            {canContactMonitors ? (
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                  onClick={() => handleSendRequest(mentor._id)}
                                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl h-12"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  Demander une session
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            ) : (
                              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                                <Lock className="h-4 w-4 text-gray-400 mx-auto mb-1.5" />
                                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                                  Payez pour un cours pour contacter les
                                  moniteurs
                                </p>
                                <Button
                                  onClick={() => setPaymentOpen(true)}
                                  size="sm"
                                  className="gap-1.5 w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                                >
                                  <CreditCard className="h-4 w-4" />
                                  Payer maintenant
                                </Button>
                              </div>
                            )}
                            */}
                          </div>
                        </CardContent>
                      </Card>
                    </AnimatedCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </motion.div>
          ) : selectedSubject ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-gray-300">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun étudiant trouvé</h3>
              <p className="text-gray-500">Aucun étudiant ne propose {selectedSubjectName} pour le moment</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* <PaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} /> */}
    </div>
  );
}
