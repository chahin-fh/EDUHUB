"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GraduationCap, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduHub
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Plateforme d&apos;apprentissage pair-à-pair. Connectez-vous avec des étudiants passionnés.
            </p>
          </div>

          {/* Links */}
          {[
            {
              title: "Plateforme",
              links: [
                { label: "Accueil", href: "/" },
                { label: "Cours", href: "/cours" },
                { label: "Apprendre", href: "/apprendre" },
                { label: "Contact", href: "/contact" },
              ],
            },
            {
              title: "Compte",
              links: [
                { label: "Connexion", href: "/connexion" },
                { label: "Inscription", href: "/inscription" },
                { label: "Profil", href: "/profile" },
                { label: "Messages", href: "/messages" },
              ],
            },
            {
              title: "Légal",
              links: [
                { label: "Confidentialité", href: "#" },
                { label: "Conditions d'utilisation", href: "#" },
                { label: "CGV", href: "#" },
                { label: "Mentions légales", href: "#" },
              ],
            },
          ].map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} EDUHUB. Tous droits réservés.
          </p>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            Fait avec <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> en Tunisie
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
