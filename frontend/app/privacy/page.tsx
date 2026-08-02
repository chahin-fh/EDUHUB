"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Database,
  Cookie,
  Share2,
  Lock,
  UserCheck,
  Clock,
  Mail,
  Sparkles,
  FileSearch,
  Eye,
} from "lucide-react";
import {
  PageTransition,
  AnimatedSection,
} from "@/components/animated-section";

const sections = [
  {
    id: "collecte",
    icon: Database,
    title: "1. Données que nous collectons",
    content: [
      "Lors de la création de votre compte, nous collectons les informations que vous nous fournissez : nom, adresse email, mot de passe (haché), photo de profil facultative et informations de profil (bio, matières, disponibilités).",
      "Lors de votre utilisation de la plateforme, nous collectons automatiquement des données telles que votre progression dans les cours, vos demandes de mise en relation, vos conversations et vos statistiques d'activité.",
    ],
  },
  {
    id: "utilisation",
    icon: FileSearch,
    title: "2. Utilisation de vos données",
    content: [
      "Vos données sont utilisées pour : vous authentifier, personnaliser votre expérience, suivre votre progression pédagogique, faciliter la mise en relation avec les moniteurs, et assurer la sécurité de la plateforme.",
      "Nous utilisons également vos données pour vous envoyer des notifications importantes (vérification d'email, réinitialisation de mot de passe, mises à jour de vos demandes) et, avec votre consentement, des communications marketing.",
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "3. Cookies et technologies similaires",
    content: [
      "EDUHUB utilise des cookies et le stockage local de votre navigateur pour maintenir votre session de connexion, mémoriser vos préférences et améliorer les performances de la plateforme.",
      "Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités de la plateforme pourraient ne plus fonctionner correctement.",
    ],
  },
  {
    id: "partage",
    icon: Share2,
    title: "4. Partage des données",
    content: [
      "Nous ne vendons jamais vos données personnelles à des tiers. Vos informations visibles (nom, photo, profil) sont partagées avec la communauté pour permettre les interactions entre étudiants et moniteurs.",
      "Pour les paiements de cours, nous transmettons les informations nécessaires à notre prestataire de paiement sécurisé Stripe, qui traite vos données conformément à sa propre politique de confidentialité.",
    ],
  },
  {
    id: "securite",
    icon: Lock,
    title: "5. Sécurité des données",
    content: [
      "La sécurité de vos données est une priorité. Vos mots de passe sont hachés avec bcrypt, votre session est protégée par des tokens JWT, et les communications sont chiffrées.",
      "Nous appliquons des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.",
    ],
  },
  {
    id: "droits",
    icon: UserCheck,
    title: "6. Vos droits",
    content: [
      "Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez de droits d'accès, de rectification, d'effacement, de limitation et de portabilité sur vos données personnelles.",
      "Vous pouvez exercer ces droits en nous contactant via la page Contact. Nous nous engageons à répondre à votre demande dans un délai raisonnable.",
    ],
  },
  {
    id: "conservation",
    icon: Clock,
    title: "7. Conservation des données",
    content: [
      "Nous conservons vos données aussi longtemps que votre compte est actif et que cela est nécessaire aux finalités décrites dans cette politique.",
      "En cas de suppression de votre compte, vos données personnelles sont supprimées ou anonymisées, sauf lorsque la loi exige leur conservation.",
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "8. Contact et responsable des données",
    content: [
      "Pour toute question relative à cette politique de confidentialité ou au traitement de vos données, vous pouvez nous contacter à l'adresse malekfhima1@gmail.com ou via la page Contact de la plateforme.",
      "Nous mettons à jour cette politique régulièrement pour refléter nos pratiques et les exigences légales. La date de dernière révision est indiquée en haut de cette page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden pt-24 pb-16">
        {/* Décorations de fond */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-purple-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-pink-200/25 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-all hover:gap-3 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Retour à l&apos;accueil
          </Link>

          {/* Hero Premium */}
          <AnimatedSection className="mb-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 sm:p-12 text-white shadow-2xl shadow-blue-900/20">
              <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 -left-10 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

              <div className="relative z-10 text-center">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-6">
                  <ShieldCheck className="h-4 w-4 text-amber-300" />
                  Protection des données
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
                  Politique de{" "}
                  <span className="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">
                    confidentialité
                  </span>
                </h1>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
                  Comment EDUHUB collecte, utilise et protège vos données
                  personnelles. Votre vie privée est notre priorité.
                </p>
                <div className="inline-flex items-center gap-2 mt-8 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl">
                  <Eye className="h-4 w-4 text-amber-300" />
                  <span className="text-sm font-medium">
                    Dernière mise à jour : 1er août 2026
                  </span>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sommaire sticky */}
            <AnimatedSection className="lg:col-span-1">
              <div className="sticky top-28 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl shadow-blue-900/5 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                  Sommaire
                </p>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors py-1.5 px-2 rounded-lg hover:bg-blue-50/50"
                    >
                      <section.icon className="h-3.5 w-3.5 text-blue-400" />
                      <span className="truncate">
                        {section.title.replace(/^\d+\.\s*/, "")}
                      </span>
                    </a>
                  ))}
                </nav>
              </div>
            </AnimatedSection>

            {/* Contenu */}
            <div className="lg:col-span-3 space-y-6">
              {sections.map((section, index) => (
                <AnimatedSection key={section.id} delay={index * 0.05}>
                  <div
                    id={section.id}
                    className="relative scroll-mt-28 bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 rounded-2xl overflow-hidden"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <div className="p-6 sm:p-8">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                          <section.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 pt-1">
                          {section.title}
                        </h2>
                      </div>
                      <div className="space-y-3 pl-[3.75rem]">
                        {section.content.map((paragraph, i) => (
                          <motion.p
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-gray-600 leading-relaxed"
                          >
                            {paragraph}
                          </motion.p>
                        ))}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}

              {/* CTA final */}
              <AnimatedSection>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-xl shadow-purple-900/20 p-8 text-center">
                  <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                  <Sparkles className="h-10 w-10 text-amber-300 mx-auto mb-3" />
                  <h3 className="text-xl font-bold mb-2">
                    Vos données, vos droits
                  </h3>
                  <p className="text-sm text-blue-100 mb-6 max-w-md mx-auto">
                    Une question sur la protection de vos données
                    personnelles ? Notre équipe est là pour vous répondre.
                  </p>
                  <Link href="/contact">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      Nous contacter
                    </motion.button>
                  </Link>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
