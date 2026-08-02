"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ScrollText,
  FileText,
  ShieldCheck,
  CreditCard,
  GraduationCap,
  AlertTriangle,
  Scale,
  RefreshCw,
  Mail,
  Sparkles,
  BookOpen,
} from "lucide-react";
import {
  PageTransition,
  AnimatedSection,
} from "@/components/animated-section";

const sections = [
  {
    id: "acceptation",
    icon: Scale,
    title: "1. Acceptation des conditions",
    content: [
      "En accédant à la plateforme EDUHUB et en créant un compte, vous acceptez d'être lié par les présentes Conditions d'utilisation, notre Politique de confidentialité et toutes les lois et réglementations applicables.",
      "Si vous n'acceptez pas l'une de ces conditions, vous êtes invité à ne pas utiliser nos services. Le simple fait d'utiliser la plateforme vaut acceptation pleine et entière de ces conditions.",
    ],
  },
  {
    id: "compte",
    icon: FileText,
    title: "2. Compte utilisateur",
    content: [
      "Pour accéder à la plupart des fonctionnalités, vous devez créer un compte avec des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants de connexion.",
      "EDUHUB se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes conditions, de comportement abusif ou d'utilisation frauduleuse de la plateforme.",
    ],
  },
  {
    id: "usage",
    icon: BookOpen,
    title: "3. Utilisation de la plateforme",
    content: [
      "La plateforme permet aux étudiants et aux moniteurs d'échanger des connaissances de manière collaborative : consultation de cours, mise en relation, messagerie, appels vidéo et partage de documents.",
      "Il est strictement interdit de partager du contenu illégal, diffamatoire, portant atteinte aux droits d'auteur, ou de harceler d'autres utilisateurs. Tout contenu signalé sera examiné par notre équipe de modération.",
    ],
  },
  {
    id: "cours",
    icon: GraduationCap,
    title: "4. Cours et contenu pédagogique",
    content: [
      "Les moniteurs publient des cours sous forme de documents et de modules de leçons. Ils garantissent détenir les droits nécessaires sur le contenu qu'ils partagent.",
      "EDUHUB peut vérifier les contenus avant publication. Les cours signalés comme contrefaits ou inappropriés peuvent être retirés sans préavis.",
    ],
  },
  {
    id: "paiements",
    icon: CreditCard,
    title: "5. Paiements et inscriptions",
    content: [
      "Certains cours sont gratuits, d'autres sont payants et réglés via notre prestataire de paiement sécurisé Stripe, en euros (€).",
      "L'inscription à un cours payant est effective après confirmation du paiement. En cas de litige, notre équipe support se tient à votre disposition via la page Contact.",
    ],
  },
  {
    id: "responsabilites",
    icon: ShieldCheck,
    title: "6. Responsabilités",
    content: [
      "EDUHUB agit comme intermédiaire entre les étudiants et les moniteurs. Nous ne pouvons pas garantir les résultats d'apprentissage, qui dépendent de l'implication de chacun.",
      "La plateforme s'efforce de maintenir un service fiable mais ne saurait être tenue responsable des interruptions temporaires, pertes de données ou dommages indirects liés à son utilisation.",
    ],
  },
  {
    id: "limitations",
    icon: AlertTriangle,
    title: "7. Limitation de responsabilité",
    content: [
      "Dans toute la mesure permise par la loi, EDUHUB ne pourra être tenu responsable des dommages directs, indirects, accessoires ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme.",
      "Les utilisateurs sont responsables du contenu qu'ils publient et des interactions qu'ils entretiennent avec les autres membres de la communauté.",
    ],
  },
  {
    id: "resiliation",
    icon: RefreshCw,
    title: "8. Résiliation",
    content: [
      "Vous pouvez cesser d'utiliser la plateforme et supprimer votre compte à tout moment. Certaines données peuvent être conservées conformément à nos obligations légales.",
      "Nous nous réservons le droit de suspendre un compte en cas de non-respect des présentes conditions.",
    ],
  },
  {
    id: "modifications",
    icon: ScrollText,
    title: "9. Modifications des conditions",
    content: [
      "EDUHUB peut mettre à jour les présentes conditions à tout moment. Les modifications prennent effet dès leur publication sur cette page, avec une mise à jour de la date de dernière révision.",
      "Votre utilisation continue de la plateforme après une modification vaut acceptation des nouvelles conditions.",
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "10. Contact",
    content: [
      "Pour toute question relative aux présentes conditions, vous pouvez nous contacter via la page Contact ou par email à malekfhima1@gmail.com.",
    ],
  },
];

export default function ConditionsPage() {
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
                  <ScrollText className="h-4 w-4 text-amber-300" />
                  Document légal
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
                  Conditions{" "}
                  <span className="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">
                    d&apos;utilisation
                  </span>
                </h1>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
                  Les règles qui régissent l&apos;utilisation de la plateforme
                  EDUHUB par les étudiants, les moniteurs et les
                  administrateurs.
                </p>
                <div className="inline-flex items-center gap-2 mt-8 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl">
                  <RefreshCw className="h-4 w-4 text-amber-300" />
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
                      <span className="truncate">{section.title.replace(/^\d+\.\s*/, "")}</span>
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
                    Une question sur ces conditions ?
                  </h3>
                  <p className="text-sm text-blue-100 mb-6 max-w-md mx-auto">
                    Notre équipe est disponible pour vous aider à comprendre
                    les règles de la plateforme.
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
