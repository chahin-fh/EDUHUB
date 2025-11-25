'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, MessageSquare, BarChart, Settings, Calendar, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
// StatCard component from the user dashboard

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "new";
  showProgress?: boolean;
};

function StatCard({ title, value, change, icon, trend, showProgress = false }: StatCardProps) {
  const trendColors = {
    up: "text-green-600 bg-green-100",
    down: "text-red-600 bg-red-100",
    new: "text-blue-600 bg-blue-100",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${trendColors[trend]}`}>{icon}</div>
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/connexion');
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }

        const userData: User = await res.json();
        if (userData.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        setUser(userData);
      } catch (error) {
        console.error(error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/connexion');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);
  const stats = [
    { title: "Utilisateurs", value: "1,234", icon: <Users className="h-5 w-5 text-purple-600" />, change: "+12%", trend: "up" as const },
    { title: "Cours", value: "89", icon: <BookOpen className="h-5 w-5 text-blue-600" />, change: "+5", trend: "up" as const },
    { title: "Messages", value: "42", icon: <MessageSquare className="h-5 w-5 text-green-600" />, change: "+3", trend: "new" as const },
    { title: "Taux d'engagement", value: "78%", icon: <BarChart className="h-5 w-5 text-amber-600" />, change: "+2%", trend: "up" as const, showProgress: true },
  ];

  const recentActivities = [
    { id: 1, user: "Jean Dupont", action: "a créé un nouveau cours", time: "Il y a 2 minutes", course: "Introduction à React" },
    { id: 2, user: "Marie Martin", action: "a rejoint la plateforme", time: "Il y a 15 minutes" },
    { id: 3, user: "Pierre Durand", action: "a terminé le cours", time: "Il y a 1 heure", course: "Les bases de TypeScript" },
    { id: 4, user: "Sophie Petit", action: "a posé une question sur", time: "Il y a 3 heures", course: "Débuter avec Next.js" },
  ];
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/connexion');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Should be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Espace Administrateur</h1>
          <div className="flex space-x-4">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Calendrier
            </Button>
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Déconnexion
            </Button>
          </div>
        </div>

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
                  <div key={activity.id} className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="p-2 rounded-full bg-blue-100 mr-4">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {activity.user} <span className="font-normal text-gray-600">{activity.action}</span> {activity.course && (
                          <Link href="#" className="text-blue-600 hover:underline">{activity.course}</Link>
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

          {/* Prochaines sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Prochaines sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="rounded-lg bg-blue-100 p-2 mr-4">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Introduction à React</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      Demain, 14h00 - 15h30
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="rounded-lg bg-blue-100 p-2 mr-4">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Atelier pratique TypeScript</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      Jeudi, 10h00 - 12h00
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
