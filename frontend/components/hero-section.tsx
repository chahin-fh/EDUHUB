"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import img from "assets/images/Student learning with mentor.jpg";
import { StaggerContainer, StaggerItem } from "@/components/animated-section";

interface HeroSectionProps {
  stats?: {
    users: number;
    monitors: number;
    averageRating: number | null;
  } | null;
}

export default function HeroSection({ stats }: HeroSectionProps) {
  const contentRef = useRef(null);
  const isInView = useInView(contentRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] },
    },
  };

  return (
    <section className="relative overflow-hidden pt-24 pb-32 min-h-[90vh] flex items-center">
      {/* Background animated gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            ref={contentRef}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="space-y-6"
          >
            <motion.div variants={childVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Votre apprentissage, votre communauté
              </span>
            </motion.div>

            <motion.h1
              variants={childVariants}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            >
              Trouvez un Mentor,
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                Soyez un Mentor
              </span>
            </motion.h1>

            <motion.p
              variants={childVariants}
              className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed"
            >
              Connectez-vous avec des étudiants passionnés et transformez votre
              parcours d&apos;apprentissage grâce à des relations de mentorat
              entre pairs.
            </motion.p>

            <motion.div
              variants={childVariants}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link
                href="/apprendre"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Trouver un mentor
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </Link>
              <Link
                href="/cours"
                className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-full font-medium hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                Explorer les cours
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={childVariants}
              className="flex items-center gap-8 pt-6 border-t border-gray-100"
            >
              <StaggerContainer className="flex gap-8" staggerDelay={0.2}>
                <StaggerItem>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats
                        ? stats.users.toLocaleString("fr-FR")
                        : "—"}
                    </p>
                    <p className="text-sm text-gray-500">Étudiants</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats
                        ? stats.monitors.toLocaleString("fr-FR")
                        : "—"}
                    </p>
                    <p className="text-sm text-gray-500">Mentors</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats && stats.averageRating !== null && stats.averageRating > 0
                        ? stats.averageRating.toLocaleString("fr-FR", {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })
                        : "—"}
                    </p>
                    <p className="text-sm text-gray-500">Note moyenne</p>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0], delay: 0.3 }}
            className="relative w-full h-[420px] md:h-[500px] flex items-center justify-center"
          >
            {/* Animated glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-2xl blur-2xl"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-300/40 rounded-xl blur-sm"
              animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-6 -left-6 w-20 h-20 bg-green-300/40 rounded-full blur-sm"
              animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Image container */}
            <motion.div
              className="relative z-10 w-full max-w-md aspect-square"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src={img}
                alt="Student learning with mentor"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain drop-shadow-2xl"
                priority
              />
            </motion.div>

            {/* Badge flottant */}
            <motion.div
              className="absolute top-8 left-0 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Apprentissage</p>
                <p className="text-xs text-gray-500">Pair-à-pair</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
