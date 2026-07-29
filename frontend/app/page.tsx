"use client";

import { useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Search, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Star,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Shield,
  Zap,
  ChevronRight
} from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem, AnimatedCard } from "@/components/animated-section";

const HeroSection = dynamic(() => import("@/components/hero-section"), {
  loading: () => <div className="h-[500px] bg-muted/50 animate-pulse rounded-xl shimmer-placeholder"></div>,
});

const MentorGrid = dynamic(() => import("@/components/mentor-grid"), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 rounded-xl shimmer-placeholder"></div>
      ))}
    </div>
  ),
});

const AuthSection = dynamic(() => import("@/components/auth-section"), {
  loading: () => <div className="h-[500px] my-12 shimmer-placeholder rounded-xl"></div>,
});

const ContactSection = dynamic(() => import("@/components/contact-section"), {
  loading: () => <div className="h-[400px] my-12 shimmer-placeholder rounded-xl"></div>,
});

const Footer = dynamic(() => import("@/components/footer"), {
  loading: () => null,
});

const ErrorMessage = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 bg-red-50 text-red-700 rounded-lg my-4 border border-red-200"
  >
    <h2 className="font-bold text-lg mb-2">Une erreur est survenue</h2>
    <p className="mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors active:scale-95"
    >
      Réessayer
    </button>
  </motion.div>
);

const features = [
  {
    icon: GraduationCap,
    title: "Apprentissage Pair-à-Pair",
    desc: "Apprenez avec d'autres étudiants qui maîtrisent les matières que vous voulez découvrir.",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Star,
    title: "Système de Notation",
    desc: "Évaluez vos sessions et construisez votre réputation au sein de la communauté.",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: MessageSquare,
    title: "Messagerie Intégrée",
    desc: "Discutez en temps réel, passez des appels vidéo et partagez votre écran.",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Shield,
    title: "Profils Vérifiés",
    desc: "Consultez les avis et les notes des autres étudiants avant de choisir.",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    icon: Zap,
    title: "Matching Intelligent",
    desc: "Trouvez le mentor parfait grâce à notre système de matching par matière et niveau.",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    icon: Users,
    title: "Communauté Active",
    desc: "Rejoignez une communauté d'étudiants passionnés qui partagent leurs connaissances.",
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50",
  },
];

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback((query: string) => {
    try {
      setSearchQuery(query);
      setError(null);
    } catch (err) {
      setError("Erreur lors de la recherche");
      console.error(err);
    }
  }, []);

  const handleRetry = () => {
    setError(null);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="flex-1">
        <HeroSection />

        {/* Features Section */}
        <AnimatedSection className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4"
              >
                <Sparkles className="w-4 h-4" />
                Fonctionnalités
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              >
                Tout ce dont vous avez besoin
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 max-w-2xl mx-auto"
              >
                Une plateforme complète pour apprendre, enseigner et collaborer
              </motion.p>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <StaggerItem key={i}>
                  <AnimatedCard className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
                    <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-7 h-7 text-${feature.color.split(" ")[0].replace("from-", "")}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl" />
                  </AnimatedCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </AnimatedSection>

        {/* Search Section */}
        <AnimatedSection direction="none" className="py-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Trouvez votre mentor
              </h2>
              <p className="text-lg text-gray-600">
                Parcourez notre communauté de mentors et trouvez celui qui vous correspond
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative max-w-2xl mx-auto mb-8"
            >
              <div className="flex items-center bg-white border-2 border-gray-200 rounded-full px-6 py-4 focus-within:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md">
                <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher un mentor par nom, matière..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none placeholder-gray-400 text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>

            {error && <ErrorMessage message={error} onRetry={handleRetry} />}

            <div className="mt-8">
              <MentorGrid subject="" search={searchQuery} />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link
                href="/apprendre"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 active:scale-95"
              >
                Voir tous les mentors
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Prêt à commencer votre voyage ?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
            >
              Rejoignez des centaines d&apos;étudiants qui apprennent et enseignent chaque jour
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/inscription"
                className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-all duration-300 active:scale-95 shadow-lg"
              >
                Créer un compte gratuit
              </Link>
              <Link
                href="/apprendre"
                className="px-8 py-4 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all duration-300 active:scale-95"
              >
                Explorer sans compte
              </Link>
            </motion.div>
          </div>
        </AnimatedSection>

        <AuthSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
