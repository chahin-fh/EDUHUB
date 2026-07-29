"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/animated-section";
import { Users, BookOpen, MessageSquare, Star, CheckCircle2, ArrowRight } from "lucide-react";

const benefits = [
  { icon: Users, text: "Connectez-vous avec des étudiants passionnés" },
  { icon: BookOpen, text: "Accélérez votre apprentissage", color: "text-blue-600" },
  { icon: MessageSquare, text: "Échangez en temps réel", color: "text-purple-600" },
  { icon: Star, text: "Construisez votre réputation", color: "text-yellow-600" },
];

export default function AuthSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Floating orbs */}
      <motion.div
        className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side */}
          <AnimatedSection direction="left" className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm mb-4">
                <Star className="w-4 h-4" />
                Communauté active
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                Prêt à commencer ?
              </h2>
              <p className="text-lg text-blue-100 leading-relaxed">
                Rejoignez des centaines d&apos;étudiants qui apprennent et enseignent chaque jour sur EDUHUB.
              </p>
            </div>

            <StaggerContainer className="space-y-4">
              {benefits.map((benefit, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-center gap-3 text-white/90">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                      <benefit.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm">{benefit.text}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedSection>

          {/* Right side */}
          <AnimatedSection direction="right">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">
                Créez votre compte gratuitement
              </h3>
              <div className="space-y-4">
                <Link
                  href="/inscription"
                  className="group flex items-center justify-between w-full px-6 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span>Créer un compte</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/apprendre"
                  className="flex items-center justify-between w-full px-6 py-4 border border-white/30 text-white rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
                >
                  <span>Explorer sans compte</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="text-center text-sm text-blue-200 mt-6">
                Déjà un compte ?{" "}
                <Link href="/connexion" className="text-white font-medium hover:underline">
                  Connectez-vous
                </Link>
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
