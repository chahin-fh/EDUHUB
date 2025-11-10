import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Mon Profil</h1>
              <p className="text-muted-foreground">Gérez vos informations personnelles</p>
            </div>
            <Button>Enregistrer les modifications</Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Photo de profil</CardTitle>
                  <CardDescription>Cette image sera visible par les autres utilisateurs.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Changer</Button>
                    <Button variant="ghost" size="sm" className="text-destructive">Supprimer</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Matières enseignées</CardTitle>
                  <CardDescription>Sélectionnez vos domaines d'expertise</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Mathématiques', 'Physique', 'Informatique', 'Anglais'].map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <input type="checkbox" id={subject} className="rounded border-gray-300" />
                        <label htmlFor={subject} className="text-sm">
                          {subject}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>Ces informations sont privées et ne seront pas visibles publiquement.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">Prénom</Label>
                      <Input id="first-name" defaultValue="Jean" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Nom</Label>
                      <Input id="last-name" defaultValue="Dupont" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="jean.dupont@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" type="tel" defaultValue="+33 6 12 34 56 78" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Date de naissance</Label>
                    <Input id="birthdate" type="date" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>À propos de moi</CardTitle>
                  <CardDescription>Décrivez-vous en quelques mots</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    className="min-h-[120px]" 
                    placeholder="Je suis un enseignant passionné par les mathématiques et l'informatique..." 
                    defaultValue="Professeur de mathématiques avec plus de 10 ans d'expérience dans l'enseignement secondaire et supérieur. Spécialisé en algèbre linéaire et en analyse."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Changer de mot de passe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mot de passe actuel</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
