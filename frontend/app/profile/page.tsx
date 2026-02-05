"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Check,
  X,
  Plus,
  Search,
  Camera,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  BookOpen,
  Award,
  Settings,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectsDisplay from "@/components/subjects-display";
import MentorsDisplay from "@/components/mentors-display";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [about, setAbout] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<
    { _id: string; name: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSubject, setSelectedSubject] = useState("");

  const handleSubjectClick = (subject: string) => {
    setSelectedSubject(subject);
    // Switch to explore tab if not already there
    if (activeTab !== "explore") {
      setActiveTab("explore");
    }
  };

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setBirthdate(user.birthdate || "");
      setAbout(user.about || "");
      setSubjects(user.expertise || []); // Use expertise field instead of subjects
    }
  }, [user]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/subjects");
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
    setSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const filteredSubjects = availableSubjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !subjects.includes(subject.name)
  );

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updatedUserData = {
        firstName,
        lastName,
        email,
        phone,
        birthdate,
        about,
        expertise: subjects, // Map subjects to expertise field
      };

      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(updatedUserData),
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.user);
        console.log("Profil mis à jour avec succès");
      } else {
        console.error("Erreur lors de la mise à jour du profil");
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div>Chargement du profil...</div>;
  }

  const avatarChar = (user.username || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mon Profil
              </h1>
              <p className="text-gray-600 mt-2">
                G&eacute;rez vos informations personnelles et votre parcours
              </p>
            </div>
            <Button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg shadow-lg transition-all duration-200"
            >
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1 shadow-sm">
              <TabsTrigger
                value="overview"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <User className="h-4 w-4 mr-2" />
                Vue d&apos;ensemble
              </TabsTrigger>
              <TabsTrigger
                value="personal"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Informations
              </TabsTrigger>
              <TabsTrigger
                value="academic"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Académique
              </TabsTrigger>
              <TabsTrigger
                value="explore"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Explorer
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Award className="h-4 w-4 mr-2" />
                Réalisations
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold">
                            {avatarChar}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="sm"
                          className="absolute bottom-0 right-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white p-2 h-8 w-8 shadow-lg"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {user.username}
                        </h2>
                        <p className="text-gray-600">{user.email}</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 border-green-200"
                          >
                            Actif
                          </Badge>
                        </div>
                      </div>
                      <Separator className="w-full" />
                      <div className="w-full space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Profil complété</span>
                          <span className="font-semibold text-gray-900">
                            75%
                          </span>
                        </div>
                        <Progress value={75} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Membre depuis</span>
                          <span className="font-semibold text-gray-900">
                            2024
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats & Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">12</h3>
                        <p className="text-gray-600 text-sm">Cours suivis</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Award className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">8</h3>
                        <p className="text-gray-600 text-sm">Certificats</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Clock className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          156
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Heures d&apos;étude
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />À propos de
                        moi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {about ||
                          "Ajoutez une description personnelle pour présenter votre parcours et vos objectifs."}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Informations personnelles
                    </CardTitle>
                    <CardDescription>
                      Ces informations sont privées et ne seront pas visibles
                      publiquement.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">Prénom</Label>
                        <Input
                          id="first-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-white/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Nom</Label>
                        <Input
                          id="last-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-white/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthdate">Date de naissance</Label>
                      <Input
                        id="birthdate"
                        type="date"
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                        className="bg-white/50"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      Localisation
                    </CardTitle>
                    <CardDescription>
                      Ajoutez votre localisation pour des recommandations
                      personnalisées.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        placeholder="Tunis"
                        className="bg-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Pays</Label>
                      <Input
                        id="country"
                        placeholder="Tunisie"
                        className="bg-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biographie</Label>
                      <Textarea
                        id="bio"
                        placeholder="Parlez-nous de vous..."
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        rows={4}
                        className="bg-white/50"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Academic Tab */}
            <TabsContent value="academic" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Matières enseignées
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez vos domaines d&apos;expertise
                  </CardDescription>
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
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                        <Plus className="h-3 w-3" /> Ajouter des matières
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher une matière..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-white/50"
                        />
                      </div>
                      {filteredSubjects.length > 0 && (
                        <ScrollArea className="h-48 w-full rounded-md border bg-white/50">
                          <div className="p-2 space-y-1">
                            {filteredSubjects.map((subject) => (
                              <div
                                key={subject._id}
                                onClick={() =>
                                  handleSubjectChange(subject.name)
                                }
                                className="p-2 rounded hover:bg-slate-100 cursor-pointer transition-colors flex items-center justify-between"
                              >
                                <span className="text-sm">{subject.name}</span>
                                <Plus className="h-4 w-4 text-blue-600" />
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Explore Tab */}
            <TabsContent value="explore" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SubjectsDisplay onSubjectClick={handleSubjectClick} />
                <MentorsDisplay selectedSubject={selectedSubject} />
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      Certificats obtenus
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              React Avancé
                            </h4>
                            <p className="text-sm text-gray-600">
                              Complété le 15 Mars 2024
                            </p>
                          </div>
                          <Award className="h-8 w-8 text-yellow-500" />
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              TypeScript Expert
                            </h4>
                            <p className="text-sm text-gray-600">
                              Complété le 28 Février 2024
                            </p>
                          </div>
                          <Award className="h-8 w-8 text-yellow-500" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      Progression d&apos;apprentissage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>JavaScript Avancé</span>
                          <span>85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>React & Next.js</span>
                          <span>72%</span>
                        </div>
                        <Progress value={72} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Node.js Backend</span>
                          <span>60%</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
