'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, MessageSquare, BarChart, Settings, Calendar, Clock } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const stats = [
    { title: "Utilisateurs", value: "1,234", icon: <Users className="h-6 w-6" />, change: "+12%" },
    { title: "Cours", value: "89", icon: <BookOpen className="h-6 w-6" />, change: "+5" },
    { title: "Messages", value: "42", icon: <MessageSquare className="h-6 w-6" />, change: "+3" },
    { title: "Taux d'engagement", value: "78%", icon: <BarChart className="h-6 w-6" />, change: "+2%" },
  ]

  const recentActivities = [
    { id: 1, user: "Jean Dupont", action: "a créé un nouveau cours", time: "Il y a 2 minutes", course: "Introduction à React" },
    { id: 2, user: "Marie Martin", action: "a rejoint la plateforme", time: "Il y a 15 minutes" },
    { id: 3, user: "Pierre Durand", action: "a terminé le cours", time: "Il y a 1 heure", course: "Les bases de TypeScript" },
    { id: 4, user: "Sophie Petit", action: "a posé une question sur", time: "Il y a 3 heures", course: "Débuter avec Next.js" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
        <div className="flex space-x-4">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Calendrier
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="h-6 w-6 text-muted-foreground">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} par rapport au mois dernier
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Activités récentes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.user} <span className="font-normal">{activity.action}</span> {activity.course && (
                        <Link href="#" className="text-primary hover:underline">{activity.course}</Link>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
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
              <div className="flex items-start space-x-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Introduction à React</p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    Demain, 14h00 - 15h30
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Atelier pratique TypeScript</p>
                  <p className="text-sm text-muted-foreground flex items-center">
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
  )
}
