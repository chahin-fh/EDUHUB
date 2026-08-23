"use client";

import { API_BASE } from "@/lib/api-config";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  MessageSquare,
  BarChart,
  Settings,
  Calendar,
  Clock,
  Loader2,
  Building,
  Sparkles,
  Activity,
  Star,
  UserCog,
  ShieldCheck,
  // CreditCard, // ⚠️ Paiement commenté
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  PageTransition,
  AnimatedSection,
  AnimatedCard,
} from "@/components/animated-section";
import EstablishmentManager from "@/components/admin/establishment-manager";
import SubjectManager from "@/components/admin/subject-manager";
import UserManager from "@/components/admin/user-manager";
import ReviewManager from "@/components/admin/review-manager";
// import PaymentManager from "@/components/admin/payment-manager"; // ⚠️ Paiement commenté
import { timeAgo } from "@/lib/utils";

const defaultStatsCards = [
  { title: "Utilisateurs", value: "—", icon: Users, change: "Chargement...", trend: "up" as const, color: "from-purple-500 to-purple-600" },
  { title: "Cours", value: "—", icon: BookOpen, change: "Chargement...", trend: "up" as const, color: "from-blue-500 to-blue-600" },
  { title: "Messages", value: "—", icon: MessageSquare, change: "Chargement...", trend: "new" as const, color: "from-green-500 to-green-600" },
  { title: "Taux d'engagement", value: "—", icon: BarChart, change: "Chargement...", trend: "up" as const, color: "from-amber-500 to-amber-600", showProgress: true },
];

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  time: string;
  course?: string;
  icon: any;
  color: string;
}

interface AdminStats {
  users: {
    total: number;
    admin: number;
    user: number;
    monitors: number;
    activeMonitors: number;
  };
  courses: { total: number; published: number };
  enrollments: number;
  messages: number;
  subjects: number;
  establishments: number;
  reviews: number;
  engagementRate: number;
  recentUsers: any[];
  recentCourses: any[];
  recentEnrollments: any[];
  recentMessages: any[];
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  color,
  showProgress = false,
  index = 0,
}: {
  title: string;
  value: string;
  change: string;
  icon: any;
  trend: "up" | "down" | "new";
  color: string;
  showProgress?: boolean;
  index?: number;
}) {
  const trendColors = {
    up: "text-green-600 bg-green-100",
    down: "text-red-600 bg-red-100",
    new: "text-blue-600 bg-blue-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="group hover:shadow-xl transition-all duration-300 border-gray-200/80 bg-white/90 backdrop-blur-sm overflow-hidden hover:-translate-y-1">
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={`p-2 rounded-lg ${trendColors[trend]}`}
            >
              <Icon className="h-5 w-5" />
            </motion.div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
          <div className="flex items-center">
            <span className={`text-xs font-medium mr-2 px-2 py-0.5 rounded-full ${trendColors[trend]}`}>
              {change}
            </span>
            {showProgress && (
              <div className="flex-1 ml-2">
                <Progress value={parseInt(value) || 0} max={100} className="h-1.5" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) { router.push("/connexion"); return; }
      if (user && user.role !== "admin") { router.replace("/dashboard"); return; }
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      const fetchAdminData = async () => {
        try {
          const token = localStorage.getItem("authToken");
          const statsRes = await fetch("${API_BASE}/api/stats/admin", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            if (statsData.success) setAdminStats(statsData.stats);
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
        }
      };
      fetchAdminData();
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Chargement du tableau de bord...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "admin") return null;

  const stats = adminStats
    ? [
        { title: "Utilisateurs", value: adminStats.users.total.toString(), icon: Users, change: `${adminStats.users.monitors} mentors`, trend: "up" as const, color: "from-purple-500 to-purple-600" },
        { title: "Cours", value: adminStats.courses.total.toString(), icon: BookOpen, change: `${adminStats.courses.published} publiés`, trend: "up" as const, color: "from-blue-500 to-blue-600" },
        { title: "Messages", value: adminStats.messages.toString(), icon: MessageSquare, change: `${adminStats.reviews} avis`, trend: "new" as const, color: "from-green-500 to-green-600" },
        { title: "Taux d'engagement", value: `${adminStats.engagementRate}%`, icon: BarChart, change: `${adminStats.enrollments} inscrits`, trend: "up" as const, color: "from-amber-500 to-amber-600", showProgress: true },
      ]
    : defaultStatsCards;

  const recentActivities: RecentActivity[] = [
    ...(adminStats?.recentUsers || []).map((u: any) => ({
      id: `u-${u._id}`,
      user: u.name || u.username || u.email,
      action: "a rejoint la plateforme",
      time: timeAgo(u.createdAt),
      icon: Users,
      color: "bg-green-100 text-green-600",
    })),
    ...(adminStats?.recentCourses || []).map((c: any) => {
      const author =
        c.instructor || c.uploadedBy || c.uploader || null;
      return {
        id: `c-${c._id}`,
        user: author?.name || author?.username || author?.email || "Un enseignant",
        action: "a créé le cours",
        time: timeAgo(c.createdAt),
        course: c.title || c.courseName,
        icon: BookOpen,
        color: "bg-blue-100 text-blue-600",
      };
    }),
    ...(adminStats?.recentEnrollments || []).map((e: any) => ({
      id: `e-${e._id}`,
      user: e.student?.name || e.student?.username || "Un étudiant",
      action: "s'est inscrit au cours",
      time: timeAgo(e.createdAt || e.enrolledAt),
      course: e.course?.title || e.course?.courseName,
      icon: Star,
      color: "bg-amber-100 text-amber-600",
    })),
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <AnimatedSection className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-3"
              >
                <Sparkles className="w-4 h-4" />
                Administration
              </motion.span>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tableau de Bord
              </h1>
              <p className="text-gray-500 mt-1">Gérez votre plateforme EDUHUB</p>
            </div>
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="gap-2 border-gray-200 hover:border-blue-300 rounded-xl">
                  <Calendar className="h-4 w-4" />
                  Calendrier
                </Button>
              </motion.div>
              <Link href="/admin/settings">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl">
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </Button>
                </motion.div>
              </Link>
            </div>
          </AnimatedSection>

          {/* Tabs */}
          <AnimatedSection delay={0.1} className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1.5 shadow-sm inline-flex flex-wrap gap-1">
              {[
                { id: "overview", label: "Vue d'ensemble", icon: Activity },
                { id: "users", label: "Utilisateurs", icon: UserCog },
                { id: "reviews", label: "Avis", icon: ShieldCheck },
                // { id: "payments", label: "Paiements", icon: CreditCard }, // ⚠️ Paiement commenté
                { id: "establishments", label: "Établissements", icon: Building },
                { id: "subjects", label: "Matières", icon: BookOpen },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </AnimatedSection>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                  {stats.map((stat, index) => (
                    <StatCard
                      key={stat.title}
                      title={stat.title}
                      value={stat.value}
                      change={stat.change}
                      icon={stat.icon}
                      trend={stat.trend}
                      color={stat.color}
                      showProgress={stat.showProgress}
                      index={index}
                    />
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Activities */}
                  <AnimatedCard className="lg:col-span-2">
                    <Card className="border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
                      <CardHeader className="border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                              <Activity className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle>Activités récentes</CardTitle>
                              <p className="text-sm text-gray-500 mt-0.5">Les dernières actions sur la plateforme</p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                          {recentActivities.map((activity, idx) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-start p-4 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                            >
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`p-2.5 rounded-xl ${activity.color} mr-4 flex-shrink-0`}
                              >
                                <activity.icon className="h-5 w-5" />
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900">
                                  {activity.user}
                                  <span className="font-normal text-gray-500"> {activity.action}</span>
                                  {activity.course && (
                                    <span className="text-blue-600 hover:underline ml-1">{activity.course}</span>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>

                  {/* Messages */}
                  <AnimatedCard delay={0.2}>
                    <Card className="border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden h-full">
                      <CardHeader className="border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-100">
                            <MessageSquare className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <CardTitle>Messages récents</CardTitle>
                            <p className="text-sm text-gray-500 mt-0.5">{(adminStats?.recentMessages || []).length} message(s)</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {(adminStats?.recentMessages || []).length > 0 ? (
                            adminStats!.recentMessages.slice(0, 4).map((message, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
                              >
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                  {(message.sender?.name || message.sender?.username || message.sender?.email || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-gray-900 truncate">
                                    {message.sender?.name || message.sender?.username || "Utilisateur"}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {message.text || message.message || message.content || "Nouveau message"}
                                  </p>
                                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                    {timeAgo(message.createdAt)}
                                  </p>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-8"
                            >
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <MessageSquare className="h-8 w-8 text-gray-300" />
                              </div>
                              <p className="text-gray-500 text-sm">Aucun message reçu</p>
                            </motion.div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <UserManager />
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ReviewManager />
              </motion.div>
            )}

            {/* ⚠️ Onglet des paiements commenté (partie paiement désactivée)
            {activeTab === "payments" && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PaymentManager />
              </motion.div>
            )}
            */}

            {activeTab === "establishments" && (
              <motion.div
                key="establishments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <EstablishmentManager />
              </motion.div>
            )}

            {activeTab === "subjects" && (
              <motion.div
                key="subjects"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SubjectManager />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
