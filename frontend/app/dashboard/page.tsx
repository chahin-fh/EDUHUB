"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, BookOpen, MessageSquare, Settings } from "lucide-react"
import Link from "next/link"



import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const handleNewCourse = () => {
    // Rediriger vers la page de création de cours
    console.log("Création d'un nouveau cours");
    // router.push("/courses/new");
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <Button onClick={handleNewCourse}>Nouveau cours</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard 
            title="Prochain cours" 
            description="Mathématiques avancées" 
            icon={<Calendar className="h-6 w-6" />}
            actionText="Voir l'emploi du temps"
            onActionClick={() => navigateTo("/schedule")}
          />
          
          <DashboardCard 
            title="En cours" 
            description="2 cours en attente" 
            icon={<Clock className="h-6 w-6" />}
            actionText="Voir les cours"
            onActionClick={() => navigateTo("/my-courses")}
          />
          
          <DashboardCard 
            title="Ressources" 
            description="5 nouvelles ressources disponibles" 
            icon={<BookOpen className="h-6 w-6" />}
            actionText="Explorer"
            onActionClick={() => navigateTo("/resources")}
          />
          
          <DashboardCard 
            title="Messages" 
            description="3 messages non lus" 
            icon={<MessageSquare className="h-6 w-6" />}
            actionText="Voir les messages"
            onActionClick={() => navigateTo("/messages")}
          />
          
          <DashboardCard 
            title="Paramètres" 
            description="Gérez votre compte" 
            icon={<Settings className="h-6 w-6" />}
            actionText="Paramètres"
            onActionClick={() => navigateTo("/settings")}
          />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Activité récente</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-start pb-4 border-b">
                <div className="bg-blue-100 p-2 rounded-full mr-4">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Nouveau cours ajouté</p>
                  <p className="text-sm text-gray-500">Mathématiques avancées - Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-4">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Nouveau message de votre tuteur</p>
                  <p className="text-sm text-gray-500">Jean Dupont - Il y a 1 jour</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardCard({ 
  title, 
  description, 
  icon, 
  actionText, 
  onActionClick 
}: {
  title: string
  description: string
  icon: React.ReactNode
  actionText: string
  onActionClick: () => void
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-6 w-6 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{description}</div>
        <button 
          onClick={onActionClick}
          className="text-sm text-blue-600 hover:underline mt-2 inline-block text-left"
        >
          {actionText} →
        </button>
      </CardContent>
    </Card>
  )
}
