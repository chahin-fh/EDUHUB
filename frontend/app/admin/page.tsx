"use client";

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
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import EstablishmentManager from "@/components/admin/establishment-manager";

// StatCard component from the user dashboard

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "new";
  showProgress?: boolean;
};

function StatCard({
  title,
  value,
  change,
  icon,
  trend,
  showProgress = false,
}: StatCardProps) {
  const trendColors = {
    up: "text-green-600 bg-green-100",
    down: "text-red-600 bg-red-100",
    new: "text-blue-600 bg-blue-100",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-gray-500">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${trendColors[trend]}`}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="flex items-center">
          <span
            className={`text-xs font-medium mr-2 px-2 py-0.5 rounded-full ${trendColors[trend]}`}
          >
            {change}
          </span>
          {showProgress && (
            <div className="flex-1 ml-2">
              <Progress
                value={parseInt(value) || 0}
                max={100}
                className="h-1.5"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface User {
  username: string;
  email: string;
  avatar?: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [userCount, setUserCount] = useState(0);
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié et est admin
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/connexion");
        return;
      }

      if (user && user.role !== "admin") {
        router.replace("/dashboard");
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    // Charger les données uniquement si l'utilisateur est admin
    if (isAuthenticated && user?.role === "admin") {
      const fetchAdminData = async () => {
        try {
          const token = localStorage.getItem("authToken");

          // Fetch user count
          const usersRes = await fetch("http://localhost:5000/api/users", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (usersRes.ok) {
            const usersData = await usersRes.json();
            setUserCount(usersData.length || 0);
          }

          // Fetch messages
          const messagesRes = await fetch(
            "http://localhost:5000/api/messages",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (messagesRes.ok) {
            const messagesData = await messagesRes.json();
            setReceivedMessages(messagesData || []);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "admin") {
    return null; // Will redirect
  }

  const stats = [
    {
      title: "Utilisateurs",
      value: userCount.toString(),
      icon: <Users className="h-5 w-5 text-purple-600" />,
      change: "+12%",
      trend: "up" as const,
    },
    {
      title: "Cours",
      value: "89",
      icon: <BookOpen className="h-5 w-5 text-blue-600" />,
      change: "+5",
      trend: "up" as const,
    },
    {
      title: "Messages",
      value: receivedMessages.length.toString(),
      icon: <MessageSquare className="h-5 w-5 text-green-600" />,
      change: "+3",
      trend: "new" as const,
    },
    {
      title: "Taux d'engagement",
      value: "78%",
      icon: <BarChart className="h-5 w-5 text-amber-600" />,
      change: "+2%",
      trend: "up" as const,
      showProgress: true,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: "Jean Dupont",
      action: "a créé un nouveau cours",
      time: "Il y a 2 minutes",
      course: "Introduction à React",
    },
    {
      id: 2,
      user: "Marie Martin",
      action: "a rejoint la plateforme",
      time: "Il y a 15 minutes",
    },
    {
      id: 3,
      user: "Pierre Durand",
      action: "a terminé le cours",
      time: "Il y a 1 heure",
      course: "Les bases de TypeScript",
    },
    {
      id: 4,
      user: "Sophie Petit",
      action: "a posé une question sur",
      time: "Il y a 3 heures",
      course: "Débuter avec Next.js",
    },
  ];
  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Espace Administrateur
          </h1>
          <div className="flex space-x-4">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Calendrier
            </Button>
            <Link href="/admin/settings">
              <Button>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Vue d&apos;ensemble
            </button>
            <button
              onClick={() => setActiveTab("establishments")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "establishments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Établissements
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <>
            {/* Statistiques */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  icon={stat.icon}
                  trend={stat.trend}
                  showProgress={stat.showProgress}
                />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Activités récentes */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Activités récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="p-2 rounded-full bg-blue-100 mr-4">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {activity.user}{" "}
                            <span className="font-normal text-gray-600">
                              {activity.action}
                            </span>{" "}
                            {activity.course && (
                              <Link
                                href="#"
                                className="text-blue-600 hover:underline"
                              >
                                {activity.course}
                              </Link>
                            )}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Messages reçus */}
              <Card>
                <CardHeader>
                  <CardTitle>Messages reçus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {receivedMessages.length > 0 ? (
                      receivedMessages.map((message, index) => (
                        <div
                          key={index}
                          className="flex items-start p-2 hover:bg-gray-50 rounded-lg cursor-pointer border-b last:border-b-0"
                        >
                          <div className="rounded-lg bg-blue-100 p-2 mr-4">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {message.subject || "Sans sujet"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {message.sender || message.email || "Anonyme"}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {message.message || message.content}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          Aucun message reçu
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "establishments" && <EstablishmentManager />}
      </div>
    </div>
  );
}
