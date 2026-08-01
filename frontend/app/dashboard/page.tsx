"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  BookOpen,
  MessageSquare,
  Settings,
  Plus,
  ChevronRight,
  Users,
  Award,
  FileText,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { motion } from "framer-motion";
import { PageTransition, AnimatedSection, StaggerContainer, StaggerItem, AnimatedCard } from "@/components/animated-section";

type ActivityItem = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  time: string;
  type: "course" | "message" | "assignment";
};

interface User {
  username: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface DashboardStats {
  enrolledCourses: number;
  studyHours: number;
  tutors: number;
  progression: number;
  weeklyActivity: { name: string; cours: number }[];
  recentActivities: {
    type: "course" | "message" | "assignment";
    title: string;
    description: string;
    time: string;
  }[];
  courseProgress: { title: string; completionPercentage: number }[];
}

const defaultStatCards = [
  { title: "Cours suivis", value: "—", change: "Chargement...", icon: BookOpen, color: "bg-blue-100 text-blue-600", trend: "up" as const },
  { title: "Heures d'étude", value: "—", change: "Chargement...", icon: Clock, color: "bg-green-100 text-green-600", trend: "up" as const },
  { title: "Tuteurs", value: "—", change: "Chargement...", icon: Users, color: "bg-purple-100 text-purple-600", trend: "new" as const },
  { title: "Progression", value: "—", change: "Chargement...", icon: TrendingUp, color: "bg-amber-100 text-amber-600", trend: "up" as const, showProgress: true },
];

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  showProgress = false,
  index = 0,
}: {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
  showProgress?: boolean;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="group hover:shadow-xl transition-all duration-300 border-gray-200/80 bg-white/90 backdrop-blur-sm overflow-hidden hover:-translate-y-1 rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-5 w-5" />
            </motion.div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
          <div className="flex items-center">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{change}</span>
            {showProgress && (
              <div className="flex-1 ml-3">
                <Progress value={parseInt(value) || 0} max={100} className="h-1.5" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/connexion");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:5000/api/stats/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) setDashStats(data.stats);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };
    fetchStats();
  }, [isAuthenticated]);

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

  if (!isAuthenticated) return null;

  const statCards = dashStats
    ? [
        { title: "Cours suivis", value: dashStats.enrolledCourses.toString(), change: "Inscriptions actives", icon: BookOpen, color: "bg-blue-100 text-blue-600", trend: "up" as const },
        { title: "Heures d'étude", value: `${dashStats.studyHours}h`, change: "Temps total", icon: Clock, color: "bg-green-100 text-green-600", trend: "up" as const },
        { title: "Tuteurs", value: dashStats.tutors.toString(), change: "Conversations actives", icon: Users, color: "bg-purple-100 text-purple-600", trend: "new" as const },
        { title: "Progression", value: `${dashStats.progression}%`, change: "Complétion moyenne", icon: TrendingUp, color: "bg-amber-100 text-amber-600", trend: "up" as const, showProgress: true },
      ]
    : defaultStatCards;

  const recentActivities: ActivityItem[] = (dashStats?.recentActivities || []).map(
    (act, i) => ({
      id: i + 1,
      title: act.title,
      description: act.description,
      time: act.time,
      type: act.type,
      icon:
        act.type === "message" ? (
          <MessageSquare className="h-5 w-5 text-green-600" />
        ) : act.type === "assignment" ? (
          <FileText className="h-5 w-5 text-amber-600" />
        ) : (
          <BookOpen className="h-5 w-5 text-blue-600" />
        ),
    })
  );

  const getActivityBgColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "course": return "bg-blue-100";
      case "message": return "bg-green-100";
      case "assignment": return "bg-amber-100";
      default: return "bg-gray-100";
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <AnimatedSection className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-3"
              >
                <Sparkles className="w-4 h-4" />
                Tableau de bord
              </motion.span>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bonjour, {user?.username} 👋
              </h1>
              <p className="text-gray-500 mt-1">Voici un aperçu de votre progression</p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={() => router.push("/cours/upload")} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-200">
                <Plus className="h-4 w-4" />
                Nouveau cours
              </Button>
            </motion.div>
          </AnimatedSection>

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {statCards.map((stat, index) => (
              <StatCard key={stat.title} {...stat} index={index} />
            ))}
          </div>

          {/* Activity Chart */}
          <AnimatedSection delay={0.2} className="mb-8">
            <Card className="border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Activité hebdomadaire</CardTitle>
                    <CardDescription>Votre progression cette semaine</CardDescription>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl border-gray-200">
                      Voir plus <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ActivityChart data={dashStats?.weeklyActivity} />
              </CardContent>
            </Card>
          </AnimatedSection>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Activity */}
            <AnimatedCard className="lg:col-span-2">
              <Card className="border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden h-full">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle>Activité récente</CardTitle>
                  <CardDescription>Vos dernières activités</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {recentActivities.map((activity, idx) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start p-4 hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => {
                          if (activity.type === "message") router.push("/messages");
                          else if (activity.type === "course") router.push("/courses");
                          else if (activity.type === "assignment") router.push("/assignments");
                        }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`p-2.5 rounded-xl ${getActivityBgColor(activity.type)} mr-4 flex-shrink-0`}
                        >
                          {activity.icon}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{activity.title}</p>
                          <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{activity.time}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-100">
                    <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl">
                      Voir toute l'activité
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>

            {/* Course Progress */}
            <AnimatedCard delay={0.2}>
              <Card className="border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden h-full">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle>Progression du cours</CardTitle>
                  <CardDescription>{dashStats?.courseProgress?.length ? `${dashStats.courseProgress.length} cours suivis` : "Vos cours"}</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-5">
                    {(dashStats?.courseProgress?.length
                      ? dashStats.courseProgress.map((c, idx) => ({
                          label: c.title,
                          value: `${c.completionPercentage}%`,
                          percent: c.completionPercentage,
                          key: `${c.title}-${idx}`,
                        }))
                      : [
                          { key: "empty", label: "Aucun cours suivi pour le moment", value: "0%", percent: 0 },
                        ]
                    ).map((item, idx) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex justify-between text-sm font-medium mb-1.5">
                          <span className="text-gray-700 truncate mr-2">{item.label}</span>
                          <span className="text-gray-900 font-semibold">{item.value}</span>
                        </div>
                        <Progress value={item.percent} max={100} className="h-2.5 rounded-full bg-gray-100" />
                      </motion.div>
                    ))}
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl">
                      Continuer le cours
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
