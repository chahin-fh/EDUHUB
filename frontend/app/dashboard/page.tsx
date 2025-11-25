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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ActivityChart } from "@/components/dashboard/activity-chart";

type ActivityItem = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  time: string;
  type: "course" | "message" | "assignment";
};

export default function DashboardPage() {
  const router = useRouter();

  const handleNewCourse = () => {
    console.log("Création d'un nouveau cours");
    // router.push("/courses/new");
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const recentActivities: ActivityItem[] = [
    {
      id: 1,
      title: "Nouveau cours ajouté",
      description: "Mathématiques avancées",
      icon: <BookOpen className="h-5 w-5 text-blue-600" />,
      time: "Il y a 2 heures",
      type: "course",
    },
    {
      id: 2,
      title: "Message de votre tuteur",
      description: "Jean Dupont",
      icon: <MessageSquare className="h-5 w-5 text-green-600" />,
      time: "Il y a 1 jour",
      type: "message",
    },
    {
      id: 3,
      title: "Devoir à rendre",
      description: "Exercices de physique",
      icon: <FileText className="h-5 w-5 text-amber-600" />,
      time: "Délai: Demain",
      type: "assignment",
    },
  ];

  const getActivityBgColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "course":
        return "bg-blue-100";
      case "message":
        return "bg-green-100";
      case "assignment":
        return "bg-amber-100";
      default:
        return "bg-gray-100";
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête avec bienvenue et bouton d'action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour, Élève 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Voici un aperçu de votre progression
            </p>
          </div>
          <Button onClick={handleNewCourse} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau cours
          </Button>
        </div>

        {/* Section des statistiques */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Cours suivis"
            value="12"
            change="+2 cette semaine"
            icon={<BookOpen className="h-5 w-5 text-blue-600" />}
            trend="up"
          />

          <StatCard
            title="Heures d'étude"
            value="24h"
            change="+5h cette semaine"
            icon={<Clock className="h-5 w-5 text-green-600" />}
            trend="up"
          />

          <StatCard
            title="Tuteurs"
            value="3"
            change="Nouveau tuteur"
            icon={<Users className="h-5 w-5 text-purple-600" />}
            trend="new"
          />

          <StatCard
            title="Progression"
            value="75%"
            change="+5% cette semaine"
            icon={<Award className="h-5 w-5 text-amber-600" />}
            trend="up"
            showProgress
          />
        </div>

        {/* Graphique d'activité */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Activité hebdomadaire</CardTitle>
                <CardDescription>
                  Votre progression cette semaine
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                Voir plus <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ActivityChart />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Section Cours à venir */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Vos dernières activités</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (activity.type === "message") navigateTo("/messages");
                      else if (activity.type === "course")
                        navigateTo("/courses");
                      else if (activity.type === "assignment")
                        navigateTo("/assignments");
                    }}
                  >
                    <div
                      className={`p-2 rounded-full ${getActivityBgColor(
                        activity.type
                      )} mr-4`}
                    >
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                className="w-full mt-4 text-blue-600 hover:text-blue-700"
              >
                Voir toute l'activité
              </Button>
            </CardContent>
          </Card>

          {/* Section Progression */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progression du cours</CardTitle>
                <CardDescription>Mathématiques avancées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Chapitres complétés</span>
                      <span>6/10</span>
                    </div>
                    <Progress value={60} max={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Devoirs rendus</span>
                      <span>4/8</span>
                    </div>
                    <Progress value={50} max={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Participation</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} max={100} className="h-2" />
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Continuer le cours
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tuteurs récents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Sophie Martin",
                      subject: "Maths",
                      avatar: "/avatars/sophie.jpg",
                    },
                    {
                      name: "Thomas Leroy",
                      subject: "Physique",
                      avatar: "/avatars/thomas.jpg",
                    },
                    {
                      name: "Emma Dubois",
                      subject: "Chimie",
                      avatar: "/avatars/emma.jpg",
                    },
                  ].map((tutor, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={tutor.avatar} alt={tutor.name} />
                        <AvatarFallback>
                          {tutor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{tutor.name}</p>
                        <p className="text-xs text-gray-500">{tutor.subject}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-8 w-8"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

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
