"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Banknote,
  Star,
  TrendingUp,
  BookOpen,
  Loader2,
  AlertCircle,
  Plus,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/animated-section";
import { timeAgo } from "@/lib/utils";

const API_BASE ="https://eduhub-for-production.onrender.com";

interface MentorCourse {
  _id: string;
  title: string;
  category?: string;
  level?: string;
  status?: string;
  thumbnail?: string;
  price?: number;
  studentsEnrolled: number;
  revenue: number;
}

interface RecentEnrollment {
  _id: string;
  student?: { _id: string; name?: string; username?: string; email?: string; avatar?: string };
  course?: { _id: string; title?: string; courseName?: string };
  paymentStatus?: string;
  amountPaid?: number;
  completionPercentage?: number;
  status?: string;
  enrolledAt?: string;
}

interface MentorStats {
  coursesCount: number;
  studentsCount: number;
  revenue: number;
  avgCompletion: number;
  rating: number;
  ratingsCount: number;
  verified: boolean;
  courses: MentorCourse[];
  recentEnrollments: RecentEnrollment[];
}

function formatEUR(n: number) {
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

function displayName(u?: { name?: string; username?: string; email?: string }) {
  return u?.name || u?.username || u?.email || "Étudiant";
}

export default function MentorOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<MentorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken") || "";
      const res = await fetch(`${API_BASE}/api/monitor/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(res.status === 429 ? "Trop de requêtes, patientez un instant" : `Erreur ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setError("");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de chargement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-gray-600">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchStats} className="gap-2 rounded-xl border-gray-200">
          <RefreshCw className="h-4 w-4" /> Réessayer
        </Button>
      </div>
    );
  }

  if (!stats) return null;
  const s = stats;
  const statCards = [
    { title: "Étudiants inscrits", value: s.studentsCount.toString(), change: "à vos cours", icon: Users, color: "from-blue-500 to-blue-600" },
    { title: "Revenus générés", value: formatEUR(s.revenue), change: "paiements complétés", icon: Banknote, color: "from-green-500 to-green-600" },
    { title: "Note moyenne", value: s.rating ? s.rating.toFixed(1) : "—", change: `${s.ratingsCount} avis`, icon: Star, color: "from-amber-500 to-amber-600" },
    { title: "Complétion moyenne", value: `${s.avgCompletion}%`, change: "progression des étudiants", icon: TrendingUp, color: "from-purple-500 to-purple-600", showProgress: true },
  ];

  return (
    <div className="space-y-8">
      {/* Bandeau vérification */}
      <AnimatedSection>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border p-5 ${
            s.verified
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
              : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.verified ? "bg-green-100" : "bg-amber-100"}`}>
              {s.verified ? (
                <ShieldCheck className="h-6 w-6 text-green-600" />
              ) : (
                <GraduationCap className="h-6 w-6 text-amber-600" />
              )}
            </div>
            <div>
              <p className={`font-semibold ${s.verified ? "text-green-800" : "text-amber-800"}`}>
                {s.verified ? "Profil de moniteur vérifié" : "Profil en attente de vérification"}
              </p>
              <p className={`text-sm ${s.verified ? "text-green-600" : "text-amber-600"}`}>
                {s.verified
                  ? "Votre badge de confiance est visible sur votre profil public."
                  : "L'équipe d'administration peut vérifier votre profil depuis l'espace admin."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/profile")} className="gap-2 rounded-xl border-gray-200">
              Gérer mon profil <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => router.push("/cours/upload")} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl">
              <Plus className="h-4 w-4" /> Nouveau cours
            </Button>
          </div>
        </motion.div>
      </AnimatedSection>

      {/* Cartes de stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ title, value, change, icon: Icon, color, showProgress = false }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Card className="group hover:shadow-xl transition-all duration-300 border-gray-200/80 bg-white/90 backdrop-blur-sm overflow-hidden hover:-translate-y-1 rounded-2xl">
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{change}</span>
                  {showProgress && (
                    <div className="flex-1 ml-3">
                      <Progress value={s.avgCompletion} max={100} className="h-1.5" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mes cours */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Mes cours</CardTitle>
                    <CardDescription>{s.coursesCount} cours créé(s)</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push("/cours")} className="gap-1 text-blue-600 rounded-xl">
                  Voir tout <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {s.courses.length === 0 ? (
                <div className="py-10 text-center">
                  <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Vous n&apos;avez pas encore créé de cours</p>
                  <Button onClick={() => router.push("/cours/upload")} className="mt-4 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                    <Plus className="h-4 w-4" /> Créer mon premier cours
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {s.courses.map((c, idx) => (
                    <motion.div
                      key={c._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => router.push(`/cours/${c._id}`)}
                      className="flex items-center gap-4 rounded-xl border border-gray-100 p-3 hover:bg-blue-50/40 hover:border-blue-200 transition-all cursor-pointer"
                    >
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                        {c.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
                        ) : (
                          c.title.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 truncate">{c.title}</span>
                          {c.status && (
                            <Badge variant="secondary" className={`text-xs ${c.status === "published" || c.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                              {c.status === "published" || c.status === "active" ? "Publié" : "Brouillon"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {c.studentsEnrolled} étudiants</span>
                          {c.revenue > 0 && (
                            <span className="flex items-center gap-1 text-green-600"><Banknote className="h-3 w-3" /> {formatEUR(c.revenue)}</span>
                          )}
                          {typeof c.price === "number" && c.price > 0 && <span>{formatEUR(c.price)}</span>}
                          {c.category && <span>{c.category}</span>}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Inscriptions récentes */}
        <div className="space-y-6">
          <Card className="border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Inscriptions récentes</CardTitle>
                  <CardDescription>Les derniers étudiants</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {s.recentEnrollments.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">Aucune inscription pour le moment</p>
              ) : (
                <div className="space-y-3">
                  {s.recentEnrollments.map((e, idx) => (
                    <motion.div
                      key={e._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 hover:bg-purple-50/30 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {displayName(e.student).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-gray-900 truncate text-sm">{displayName(e.student)}</span>
                          <span className="text-[11px] text-gray-400 whitespace-nowrap">{timeAgo(e.enrolledAt)}</span>
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {e.course?.title || e.course?.courseName || "Cours"}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Progress value={e.completionPercentage || 0} max={100} className="h-1.5 flex-1" />
                          <span className="text-[11px] text-gray-400">{e.completionPercentage || 0}%</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          {e.paymentStatus === "completed" && (
                            <Badge className="text-[10px] bg-green-50 text-green-700 border-green-200">Payé · {formatEUR(e.amountPaid || 0)}</Badge>
                          )}
                          {e.status === "completed" && (
                            <Badge className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Terminé</Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
