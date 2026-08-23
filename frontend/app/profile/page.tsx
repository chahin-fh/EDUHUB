"use client";

import { API_BASE } from "@/lib/api-config";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Star,
  GraduationCap,
  Github,
  Linkedin,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectsDisplay from "@/components/subjects-display";
import MentorsDisplay from "@/components/mentors-display";
import EmailVerificationBanner from "@/components/email-verification-banner";
import SocialLinks from "@/components/social-links";
import { PageTransition, AnimatedSection, AnimatedCard, StaggerContainer, StaggerItem } from "@/components/animated-section";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [about, setAbout] = useState("");
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [subjects, setSubjects] = useState<
    { subjectId: string; subjectName: string; level: string }[]
  >([]);
  const [learningGoals, setLearningGoals] = useState<
    { subjectId: string; subjectName: string; level: string }[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<
    { _id: string; name: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [learnSearchQuery, setLearnSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const levels = ["Débutant", "Intermédiaire", "Avancé"];

  const handleSubjectClick = (subject: string) => {
    // Toggle : re-cliquer sur la matière active la désélectionne
    setSelectedSubject((prev) => (prev === subject ? "" : subject));
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
      setCity(user.city || "");
      setCountry(user.country || "");
      setGithub(user.github || "");
      setLinkedin(user.linkedin || "");
      setAbout(user.about || user.bio || "");

      // Load expertise from user
      if (user.monitorProfile?.expertise) {
        setSubjects(
          user.monitorProfile.expertise.map((e) => ({
            subjectId:
              typeof e.subject === "object" ? e.subject._id : e.subject,
            subjectName:
              typeof e.subject === "object" ? e.subject.name : e.subject,
            level: e.level || "Intermédiaire",
          }))
        );
      }

      // Load learning goals
      if (user.learningGoals) {
        setLearningGoals(
          user.learningGoals.map((g) => ({
            subjectId:
              typeof g.subject === "object" ? g.subject._id : g.subject,
            subjectName:
              typeof g.subject === "object" ? g.subject.name : g.subject,
            level: g.level || "Débutant",
          }))
        );
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch("${API_BASE}/api/subjects");
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

  // Résout les noms des matières quand elles sont stockées comme simple ID
  // (ex: données du localStorage avant population) : remplace l'ID par le nom.
  useEffect(() => {
    if (availableSubjects.length === 0) return;

    const resolveName = (subjectId: string, currentName: string) => {
      const found = availableSubjects.find((a) => a._id === subjectId);
      if (found && (!currentName || currentName === subjectId)) {
        return found.name;
      }
      return currentName;
    };

    setSubjects((prev) =>
      prev.map((s) => ({ ...s, subjectName: resolveName(s.subjectId, s.subjectName) }))
    );
    setLearningGoals((prev) =>
      prev.map((g) => ({ ...g, subjectName: resolveName(g.subjectId, g.subjectName) }))
    );
  }, [availableSubjects]);

  const handleTeachingSubjectChange = (subject: {
    subjectId: string;
    subjectName: string;
    level: string;
  }) => {
    setSubjects((prev) => {
      const exists = prev.find((s) => s.subjectId === subject.subjectId);
      if (exists) {
        return prev.filter((s) => s.subjectId !== subject.subjectId);
      }
      return [...prev, subject];
    });
  };

  const handleLearningGoalChange = (goal: {
    subjectId: string;
    subjectName: string;
    level: string;
  }) => {
    setLearningGoals((prev) => {
      const exists = prev.find((s) => s.subjectId === goal.subjectId);
      if (exists) {
        return prev.filter((s) => s.subjectId !== goal.subjectId);
      }
      return [...prev, goal];
    });
  };

  const filteredSubjects = availableSubjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !subjects.some((s) => s.subjectId === subject._id)
  );

  const filteredLearnSubjects = availableSubjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(learnSearchQuery.toLowerCase()) &&
      !learningGoals.some((g) => g.subjectId === subject._id)
  );

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updatedUserData = {
        firstName,
        lastName,
        email,
        phone,
        birthdate,
        city,
        country,
        github,
        linkedin,
        about,
        // Send expertise as array of { subject: ObjectId, level: string }
        expertise: subjects.map((s) => ({
          subject: s.subjectId,
          level: s.level,
        })),
        // Send learning goals
        learningGoals: learningGoals.map((g) => ({
          subject: g.subjectId,
          level: g.level,
        })),
      };

      const response = await fetch("${API_BASE}/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(updatedUserData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors de la mise à jour du profil"
        );
      }

      updateUser(data.user);
      setSaveMessage({
        type: "success",
        text: "Profil mis à jour avec succès",
      });

      if (data.emailChanged) {
        setSaveMessage({
          type: "success",
          text: "Profil mis à jour. Un email de vérification a été envoyé à votre nouvelle adresse — votre compte devra être re-vérifié.",
        });
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      setSaveMessage({
        type: "error",
        text: error.message || "Une erreur est survenue lors de la mise à jour",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setAvatarError("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(
        "${API_BASE}/api/auth/upload-avatar",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || errData.message || "Erreur lors de l'upload de la photo"
        );
      }

      const data = await response.json();
      if (data.success && data.url) {
        updateUser({ avatar: data.url });
      } else {
        throw new Error("Réponse invalide du serveur");
      }
    } catch (err: any) {
      console.error(err);
      setAvatarError(err.message || "Erreur lors de l'upload de la photo");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  if (!user) {
    return <div>Chargement du profil...</div>;
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    "Utilisateur";
  const avatarChar = (displayName || "U").charAt(0).toUpperCase();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-8">
            {/* Header */}
            <AnimatedSection className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Mon Profil
                </h1>
                <p className="text-gray-600 mt-2">
                  G&eacute;rez vos informations personnelles et votre parcours
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl shadow-lg transition-all duration-200"
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </motion.div>
            </AnimatedSection>

            {user.emailVerified === false && user.role !== "admin" && (
              <EmailVerificationBanner email={user.email} />
            )}

            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
                  saveMessage.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {saveMessage.type === "success" ? (
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
                )}
                <span>{saveMessage.text}</span>
              </motion.div>
            )}

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
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={avatarUploading}
                          className="absolute bottom-0 right-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white p-2 h-8 w-8 shadow-lg disabled:opacity-70"
                        >
                          {avatarUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </div>
                      {avatarError && (
                        <p className="text-xs text-red-500 -mt-2 text-center">
                          {avatarError}
                        </p>
                      )}
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {displayName}
                        </h2>
                        <p className="text-gray-600">{user.email}</p>
                        <SocialLinks
                          github={user.github}
                          linkedin={user.linkedin}
                          className="justify-center"
                        />
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 border-blue-200"
                          >
                            Étudiant
                          </Badge>
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
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Pays</Label>
                      <Input
                        id="country"
                        placeholder="Tunisie"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="bg-white/50"
                      />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub</Label>
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="github"
                          placeholder="https://github.com/pseudo"
                          value={github}
                          onChange={(e) => setGithub(e.target.value)}
                          className="bg-white/50 pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="linkedin"
                          placeholder="https://linkedin.com/in/pseudo"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          className="bg-white/50 pl-10"
                        />
                      </div>
                    </div>
                    <Separator />
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
              {/* Teaching Subjects */}
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    Matières que j&apos;enseigne
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez les matières que vous maîtrisez et pouvez enseigner
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
                              key={subject.subjectId}
                              variant="secondary"
                              className="pl-2.5 pr-1.5 py-1 h-8 text-sm bg-white border shadow-sm hover:bg-slate-100 transition-all flex items-center gap-1.5"
                            >
                              {subject.subjectName}
                              <span className="text-xs text-gray-500 ml-1">({subject.level})</span>
                              <select
                                value={subject.level}
                                onChange={(e) => {
                                  const newLevel = e.target.value;
                                  setSubjects((prev) =>
                                    prev.map((s) =>
                                      s.subjectId === subject.subjectId
                                        ? { ...s, level: newLevel }
                                        : s
                                    )
                                  );
                                }}
                                className="ml-1 text-xs border-0 bg-transparent focus:outline-none cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {levels.map((l) => (
                                  <option key={l} value={l}>
                                    {l}
                                  </option>
                                ))}
                              </select>
                              <div
                                className="h-4 w-4 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                                onClick={() =>
                                  handleTeachingSubjectChange(subject)
                                }
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
                                  handleTeachingSubjectChange({
                                    subjectId: subject._id,
                                    subjectName: subject.name,
                                    level: "Intermédiaire",
                                  })
                                }
                                className="p-2 rounded hover:bg-slate-100 cursor-pointer transition-colors flex items-center justify-between group"
                              >
                                <span className="text-sm">{subject.name}</span>
                                <Plus className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Goals */}
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-orange-600" />
                    Matières que je veux apprendre
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez les matières que vous souhaitez apprendre
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Selected Learning Goals */}
                    <div className="min-h-[80px] p-4 border rounded-lg bg-slate-50/50 space-y-3">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                        <Check className="h-3 w-3" /> Objectifs d&apos;apprentissage
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {learningGoals.length > 0 ? (
                          learningGoals.map((goal) => (
                            <Badge
                              key={goal.subjectId}
                              variant="secondary"
                              className="pl-2.5 pr-1.5 py-1 h-8 text-sm bg-white border border-orange-200 shadow-sm hover:bg-slate-100 transition-all flex items-center gap-1.5"
                            >
                              {goal.subjectName}
                              <span className="text-xs text-gray-500 ml-1">({goal.level})</span>
                              <select
                                value={goal.level}
                                onChange={(e) => {
                                  const newLevel = e.target.value;
                                  setLearningGoals((prev) =>
                                    prev.map((g) =>
                                      g.subjectId === goal.subjectId
                                        ? { ...g, level: newLevel }
                                        : g
                                    )
                                  );
                                }}
                                className="ml-1 text-xs border-0 bg-transparent focus:outline-none cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {levels.map((l) => (
                                  <option key={l} value={l}>
                                    {l}
                                  </option>
                                ))}
                              </select>
                              <div
                                className="h-4 w-4 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                                onClick={() =>
                                  handleLearningGoalChange(goal)
                                }
                              >
                                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                              </div>
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground italic pl-1">
                            Aucun objectif d&apos;apprentissage pour le moment
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Search & Selection */}
                    <div className="space-y-3">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                        <Plus className="h-3 w-3" /> Ajouter des matières à apprendre
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher une matière..."
                          value={learnSearchQuery}
                          onChange={(e) => setLearnSearchQuery(e.target.value)}
                          className="pl-10 bg-white/50"
                        />
                      </div>
                      {filteredLearnSubjects.length > 0 && (
                        <ScrollArea className="h-48 w-full rounded-md border bg-white/50">
                          <div className="p-2 space-y-1">
                            {filteredLearnSubjects.map((subject) => (
                              <div
                                key={subject._id}
                                onClick={() =>
                                  handleLearningGoalChange({
                                    subjectId: subject._id,
                                    subjectName: subject.name,
                                    level: "Débutant",
                                  })
                                }
                                className="p-2 rounded hover:bg-orange-50 cursor-pointer transition-colors flex items-center justify-between group"
                              >
                                <span className="text-sm">{subject.name}</span>
                                <Plus className="h-4 w-4 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
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
              {/* Banner */}
              <AnimatedSection>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
                  <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
                  <div className="absolute bottom-0 right-24 w-24 h-24 rounded-full bg-white/10" />
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-3"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Explorer
                  </motion.span>
                  <h2 className="text-2xl font-bold mb-2">
                    Explorez la communaut&eacute;
                  </h2>
                  <p className="text-blue-100 text-sm max-w-lg">
                    Parcourez les mati&egrave;res disponibles et trouvez les
                    &eacute;tudiants et mentors qui peuvent vous aider &agrave;
                    progresser.
                  </p>
                </div>
              </AnimatedSection>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <SubjectsDisplay
                  onSubjectClick={handleSubjectClick}
                  selectedSubject={selectedSubject}
                />
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
    </PageTransition>
  );
}
