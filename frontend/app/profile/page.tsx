"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { Check, X, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [about, setAbout] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<{ _id: string, name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBirthdate(user.birthdate || '');
      setAbout(user.about || '');
      setSubjects(user.subjects || []);
    }
  }, [user]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/subjects');
        if (res.ok) {
          const data = await res.json();
          setAvailableSubjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch subjects", error);
      }
    };
    fetchSubjects();
  }, []);

  const handleSubjectChange = (subject: string) => {
    setSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const filteredSubjects = availableSubjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !subjects.includes(subject.name)
  );

  const handleSaveChanges = () => {
    setIsSaving(true);
    const updatedUserData = { firstName, lastName, email, phone, birthdate, about, subjects };
    updateUser(updatedUserData);
    // In a real app, you'd likely show a success message
    setTimeout(() => setIsSaving(false), 1000); // Simulate API call
  };

  if (!user) {
    return <div>Chargement du profil...</div>;
  }

  const avatarChar = (user.username || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Mon Profil</h1>
              <p className="text-muted-foreground">Gérez vos informations personnelles</p>
            </div>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Photo de profil</CardTitle>
                <CardDescription>Cette image sera visible par les autres utilisateurs.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{avatarChar}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Changer la photo</Button>
                    <Button variant="ghost" size="sm" className="text-destructive">Supprimer</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    JPG, GIF ou PNG. 1MB max.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Ces informations sont privées et ne seront pas visibles publiquement.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">Prénom</Label>
                    <Input id="first-name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Nom</Label>
                    <Input id="last-name" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Date de naissance</Label>
                  <Input id="birthdate" type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Matières enseignées</CardTitle>
                <CardDescription>Sélectionnez vos domaines d&apos;expertise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Selected Subjects Area */}
                  <div className="min-h-[80px] p-4 border rounded-lg bg-slate-50/50 space-y-3">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                      <Check className="h-3 w-3" /> Matières sélectionnées
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {subjects.length > 0 ? (
                        subjects.map((subject) => (
                          <Badge
                            key={subject}
                            variant="secondary"
                            className="pl-2.5 pr-1.5 py-1 h-8 text-sm bg-white border shadow-sm hover:bg-slate-100 transition-all flex items-center gap-1.5"
                          >
                            {subject}
                            <div
                              className="h-4 w-4 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                              onClick={() => handleSubjectChange(subject)}
                            >
                              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </div>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground italic pl-1">
                          Aucune matière sélectionnée pour le moment
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Search & Selection Area */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher une matière à ajouter..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white"
                      />
                    </div>

                    <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                      <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                        <span className="text-xs font-medium text-muted-foreground">
                          Matières disponibles
                        </span>
                        <span className="text-xs text-muted-foreground bg-slate-200 px-2 py-0.5 rounded-full">
                          {filteredSubjects.length}
                        </span>
                      </div>
                      <ScrollArea className="h-[200px] w-full">
                        <div className="p-2">
                          {filteredSubjects.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {filteredSubjects.map((subject) => (
                                <div
                                  key={subject._id}
                                  className="flex items-center justify-between px-3 py-2.5 text-sm rounded-md border border-transparent hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-all group"
                                  onClick={() => handleSubjectChange(subject.name)}
                                >
                                  <span className="font-medium truncate">{subject.name}</span>
                                  <div className="h-6 w-6 rounded-full bg-white border border-blue-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm shrink-0">
                                    <Plus className="h-3 w-3 text-blue-600" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                              <Search className="h-8 w-8 mb-2 opacity-20" />
                              <p className="text-sm font-medium">
                                {searchQuery
                                  ? "Aucun résultat trouvé"
                                  : "Toutes les matières sont sélectionnées"}
                              </p>
                              {searchQuery && (
                                <p className="text-xs mt-1 text-muted-foreground/70">
                                  Essayez une autre recherche
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
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
                  value={about}
                  onChange={e => setAbout(e.target.value)}
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
  )
}
