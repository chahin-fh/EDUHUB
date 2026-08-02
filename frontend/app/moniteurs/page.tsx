// app/moniteurs/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  GraduationCap,
  MessageSquare,
  Users,
  Sparkles,
  BadgeCheck,
  X,
} from "lucide-react";
import {
  PageTransition,
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/animated-section";

const mentors = [
  {
    id: 1,
    name: "Jean Dupont",
    title: "Développeur Full Stack",
    experience: "8 ans",
    rating: 4.9,
    students: 1245,
    image: "/images/mentor1.jpg",
    skills: ["React", "Node.js", "TypeScript"],
  },
  {
    id: 2,
    name: "Sonia Ben Salah",
    title: "Data Scientist",
    experience: "6 ans",
    rating: 4.8,
    students: 890,
    image: "/images/mentor2.jpg",
    skills: ["Python", "Machine Learning", "SQL"],
  },
  {
    id: 3,
    name: "Karim Trabelsi",
    title: "Designer UX/UI",
    experience: "5 ans",
    rating: 4.7,
    students: 654,
    image: "/images/mentor3.jpg",
    skills: ["Figma", "UI Design", "Prototypage"],
  },
  {
    id: 4,
    name: "Amira Ben Amor",
    title: "Cloud Architect",
    experience: "9 ans",
    rating: 5.0,
    students: 1520,
    image: "/images/mentor4.jpg",
    skills: ["AWS", "Docker", "Kubernetes"],
  },
  {
    id: 5,
    name: "Mohamed Ali Gharbi",
    title: "Expert Cybersécurité",
    experience: "7 ans",
    rating: 4.9,
    students: 1103,
    image: "/images/mentor5.jpg",
    skills: ["Pentest", "Sécurité", "Réseaux"],
  },
  {
    id: 6,
    name: "Yasmine Haddad",
    title: "Développeuse Mobile",
    experience: "4 ans",
    rating: 4.6,
    students: 432,
    image: "/images/mentor6.jpg",
    skills: ["React Native", "Flutter", "Swift"],
  },
];

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-indigo-500 to-purple-600",
  "from-blue-600 to-cyan-600",
  "from-violet-500 to-blue-600",
  "from-fuchsia-500 to-purple-600",
];

export default function MoniteursPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden pt-24 pb-16">
        {/* Décorations de fond */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -left-40 h-[28rem] w-[28rem] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-pink-200/25 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Premium */}
          <AnimatedSection className="mb-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 sm:p-12 text-white shadow-2xl shadow-blue-900/20">
              <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 -left-10 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

              <div className="relative z-10 text-center">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Nos experts
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
                  Nos moniteurs{" "}
                  <span className="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">
                    expérimentés
                  </span>
                </h1>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
                  Apprenez auprès des meilleurs professionnels du secteur.
                  Chaque moniteur est vérifié et noté par sa communauté.
                </p>

                {/* Stats chips */}
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl">
                    <Users className="h-4 w-4 text-amber-300" />
                    <span className="text-sm font-medium">
                      {mentors.length} moniteurs
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl">
                    <BadgeCheck className="h-4 w-4 text-amber-300" />
                    <span className="text-sm font-medium">
                      Profils vérifiés
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl">
                    <Star className="h-4 w-4 text-amber-300" />
                    <span className="text-sm font-medium">4.8/5 moyen</span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Recherche */}
          <AnimatedSection delay={0.1} className="mb-12">
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Rechercher un moniteur ou une compétence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-12 h-14 text-lg bg-white/90 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-xl rounded-2xl"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </AnimatedSection>

          {/* Grille */}
          {filteredMentors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Aucun moniteur trouvé
              </h3>
              <p className="text-gray-600 mb-6">
                Essayez avec un autre terme de recherche.
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl"
              >
                Effacer la recherche
              </Button>
            </motion.div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMentors.map((mentor, index) => {
                const gradient =
                  AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
                return (
                  <StaggerItem key={mentor.id}>
                    <motion.div
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ type: "spring", bounce: 0.4 }}
                      className="group h-full bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-lg shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 cursor-pointer relative"
                    >
                      {/* Header avec avatar */}
                      <div
                        className={`relative h-40 bg-gradient-to-br ${gradient} overflow-hidden`}
                      >
                        <div className="pointer-events-none absolute -top-10 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl group-hover:scale-125 transition-transform duration-500" />
                        <div className="pointer-events-none absolute -bottom-12 -left-6 h-36 w-36 rounded-full bg-pink-400/20 blur-2xl" />
                        <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />

                        {/* Badge vérifié */}
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                          <BadgeCheck className="h-3.5 w-3.5 text-blue-600" />
                          <span className="text-gray-700">Vérifié</span>
                        </div>

                        {/* Avatar */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${gradient} border-4 border-white flex items-center justify-center shadow-xl`}
                          >
                            <span className="text-2xl font-extrabold text-white">
                              {mentor.name.charAt(0)}
                            </span>
                          </motion.div>
                        </div>
                      </div>

                      <CardHeader className="pt-14 text-center">
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {mentor.name}
                        </CardTitle>
                        <p className="text-gray-500">{mentor.title}</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-bold text-gray-900">
                            {mentor.rating}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="flex flex-wrap justify-center gap-2 mb-5">
                          {mentor.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-5">
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="h-4 w-4 text-purple-500" />
                            <span>{mentor.experience} d&apos;expérience</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span>{mentor.students} étudiants</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 rounded-xl border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                            size="sm"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contacter
                          </Button>
                          <Button
                            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            size="sm"
                          >
                            Voir le profil
                          </Button>
                        </div>
                      </CardContent>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
