// app/contact/page.tsx
"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  User,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  HeartHandshake,
  Loader2,
} from "lucide-react";
import {
  PageTransition,
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/animated-section";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Erreur lors de l'envoi du message"
        );
      }

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setSubmitStatus({
        success: true,
        message:
          "Votre message a bien été envoyé ! Nous vous répondrons dans les plus brefs délais.",
      });
    } catch (error: any) {
      console.error(error);
      setSubmitStatus({
        success: false,
        message:
          error.message ||
          "Une erreur est survenue. Veuillez réessayer plus tard.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      lines: ["malekfhima1@gmail.com"],
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: Phone,
      title: "Téléphone",
      lines: ["+216 25992977", "Lundi - Vendredi, 9h - 18h"],
      gradient: "from-purple-500 to-pink-600",
    },
    {
      icon: MapPin,
      title: "Adresse",
      lines: ["M\u2019saken, Sousse, Tunis", "4070 M\u2019saken, Sousse, Tunis"],
      gradient: "from-indigo-500 to-purple-600",
    },
  ];

  const hours = [
    { day: "Lundi - Vendredi", hours: "9h00 - 18h00", open: true },
    { day: "Samedi", hours: "10h00 - 14h00", open: true },
    { day: "Dimanche", hours: "Fermé", open: false },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden pt-24 pb-16">
        {/* Décorations de fond */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-purple-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-pink-200/25 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Premium */}
          <AnimatedSection className="mb-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 sm:p-12 text-white shadow-2xl shadow-blue-900/20">
              <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 -left-10 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

              <div className="relative z-10 text-center">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Support & assistance
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
                  Contactez-{" "}
                  <span className="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">
                    nous
                  </span>
                </h1>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
                  Notre équipe est là pour répondre à toutes vos questions. Nous
                  vous répondrons dans les plus brefs délais.
                </p>
                <div className="inline-flex items-center gap-2 mt-8 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl">
                  <HeartHandshake className="h-4 w-4 text-amber-300" />
                  <span className="text-sm font-medium">
                    Réponse sous 24h en moyenne
                  </span>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire */}
            <StaggerContainer className="space-y-6">
              <StaggerItem>
                <Card className="relative bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 rounded-2xl overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-600/25">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Envoyez-nous un message
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Remplissez le formulaire et nous vous répondrons
                      rapidement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnimatePresence>
                      {submitStatus && (
                        <motion.div
                          initial={{ opacity: 0, y: -12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -12, scale: 0.98 }}
                          className={`p-4 mb-6 rounded-xl flex items-start gap-3 border ${
                            submitStatus.success
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                              : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                          }`}
                        >
                          {submitStatus.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <p
                            className={`text-sm ${
                              submitStatus.success
                                ? "text-green-800"
                                : "text-red-800"
                            }`}
                          >
                            {submitStatus.message}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="name"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Nom complet
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="name"
                              name="name"
                              placeholder="Votre nom"
                              required
                              value={formData.name}
                              onChange={handleChange}
                              disabled={isSubmitting}
                              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="votre@email.com"
                              required
                              value={formData.email}
                              onChange={handleChange}
                              disabled={isSubmitting}
                              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="subject"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Sujet
                        </label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="subject"
                            name="subject"
                            placeholder="Sujet de votre message"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="message"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Message
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Décrivez-nous votre demande..."
                          rows={5}
                          required
                          value={formData.message}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          className="border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all resize-none"
                        />
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Send className="h-5 w-5 mr-2" />
                              Envoyer le message
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>

            {/* Coordonnées */}
            <StaggerContainer className="space-y-6">
              <StaggerItem>
                <Card className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                      </div>
                      Nos coordonnées
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      N&apos;hésitez pas à nous contacter par téléphone ou par
                      email
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {contactInfo.map((item) => (
                      <div key={item.title} className="flex items-start gap-4 group">
                        <div
                          className={`p-3 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg transition-transform group-hover:scale-110 flex-shrink-0`}
                        >
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {item.title}
                          </h3>
                          {item.lines.map((line, i) => (
                            <p
                              key={i}
                              className={
                                i === 0 ? "text-gray-600" : "text-sm text-gray-500"
                              }
                            >
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      Heures d&apos;ouverture
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {hours.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-3 rounded-xl bg-gray-50/80 border border-gray-100"
                      >
                        <span className="text-gray-600 font-medium">
                          {item.day}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.open
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.hours}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-xl shadow-purple-900/20 p-6 text-center">
                  <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                  <HeartHandshake className="h-10 w-10 text-amber-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-1">
                    Nous sommes là pour vous aider
                  </h3>
                  <p className="text-sm text-blue-100">
                    Chaque message compte. Merci de nous faire confiance.
                  </p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
