"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  User,
  ShieldCheck,
  Bell,
  Sparkles,
  Save,
  Lock,
  Camera,
  CheckCircle,
} from "lucide-react";
import {
  PageTransition,
  AnimatedSection,
} from "@/components/animated-section";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true,
  });

  const [profile, setProfile] = useState({
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    bio: "Développeur passionné par React et le design UI/UX",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de mise à jour du profil
    console.log("Profil mis à jour:", profile);
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de changement de mot de passe
    console.log("Mot de passe changé");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden pt-24 pb-16">
        {/* Décorations de fond */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-purple-200/30 blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <AnimatedSection className="mb-10">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 sm:p-10 text-white shadow-2xl shadow-blue-900/20">
              <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 -left-10 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Compte
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold">
                  Paramètres
                </h1>
                <p className="text-blue-100 mt-2 max-w-xl">
                  Gérez vos préférences et vos informations personnelles
                </p>
              </div>
            </div>
          </AnimatedSection>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-1.5 shadow-lg shadow-blue-900/5 w-full sm:w-auto grid grid-cols-3">
              <TabsTrigger
                value="profile"
                className="rounded-xl gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profil</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-xl gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Sécurité</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="rounded-xl gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="relative bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 rounded-2xl overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      Profil
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Mettez à jour vos informations personnelles
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmitProfile}>
                    <CardContent className="space-y-6">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <Avatar className="h-20 w-20 ring-4 ring-blue-100">
                            <AvatarImage
                              src="/placeholder-avatar.jpg"
                              alt="Profile"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
                              JD
                            </AvatarFallback>
                          </Avatar>
                          <button
                            type="button"
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg"
                          >
                            <Camera className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                          >
                            Changer de photo
                          </Button>
                          <p className="mt-2 text-sm text-gray-500">
                            JPG, GIF ou PNG. 2MB max.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Nom complet
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={profile.name}
                            onChange={handleProfileChange}
                            className="border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profile.email}
                            onChange={handleProfileChange}
                            className="border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="bio"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Bio
                        </Label>
                        <textarea
                          id="bio"
                          name="bio"
                          rows={4}
                          className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                          value={profile.bio}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-gray-100 px-6 py-4">
                      <Button
                        type="submit"
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-600/25"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer les modifications
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="security">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="relative bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 rounded-2xl overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-amber-600" />
                      </div>
                      Sécurité
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Modifiez votre mot de passe
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmitPassword}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="current-password"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Mot de passe actuel
                        </Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="new-password"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Nouveau mot de passe
                        </Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="confirm-password"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Confirmer le nouveau mot de passe
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-gray-100 px-6 py-4">
                      <Button
                        type="submit"
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-600/25"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Mettre à jour le mot de passe
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="notifications">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="relative bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 rounded-2xl overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-purple-600" />
                      </div>
                      Notifications
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Configurez comment vous recevez les notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        key: "email" as const,
                        label: "Notifications par email",
                        desc: "Recevoir des notifications par email",
                        icon: "✉️",
                      },
                      {
                        key: "push" as const,
                        label: "Notifications push",
                        desc: "Recevoir des notifications sur votre appareil",
                        icon: "📱",
                      },
                      {
                        key: "marketing" as const,
                        label: "Emails marketing",
                        desc: "Recevoir des offres spéciales et des mises à jour",
                        icon: "🎯",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 border border-gray-100 transition-all hover:border-blue-200 hover:bg-blue-50/40"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm">
                            {item.icon}
                          </div>
                          <div>
                            <Label
                              htmlFor={`${item.key}-notifications`}
                              className="text-sm font-semibold text-gray-900"
                            >
                              {item.label}
                            </Label>
                            <p className="text-sm text-gray-500">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={`${item.key}-notifications`}
                          checked={notifications[item.key]}
                          onCheckedChange={() =>
                            handleNotificationChange(item.key)
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="border-t border-gray-100 px-6 py-4">
                    <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-600/25">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Enregistrer les préférences
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
}
