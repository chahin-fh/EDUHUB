"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
import { Label } from "@/components/ui/label";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Loader2,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/animated-section";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "contact@eduhub.tn",
    href: "mailto:contact@eduhub.tn",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: "+216 XX XXX XXX",
    href: "tel:+216XXXXXXXXX",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "Tunis, Tunisie",
    href: "#",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
];

export default function ContactSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Erreur lors de l'envoi du message");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de l'envoi du message");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Message envoyé !</h2>
            <p className="text-gray-600 mb-8">
              Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.
            </p>
            <Button
              onClick={() => { setIsSubmitted(false); setError(""); setFormData({ name: "", email: "", subject: "", message: "" }); }}
              variant="outline"
              className="rounded-full"
            >
              Envoyer un autre message
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <MessageSquare className="w-4 h-4" />
            Contact
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Restons en contact
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vous avez une question ? N&apos;hésitez pas à nous contacter
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
          {/* Contact Info */}
          <AnimatedSection direction="left" className="space-y-8">
            <StaggerContainer className="space-y-4">
              {contactInfo.map((info, i) => (
                <StaggerItem key={i}>
                  <motion.a
                    href={info.href}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 group"
                  >
                    <div className={`w-14 h-14 ${info.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <info.icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{info.label}</p>
                      <p className="text-gray-900 font-semibold">{info.value}</p>
                    </div>
                  </motion.a>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedSection>

          {/* Contact Form */}
          <AnimatedSection direction="right">
            <Card className="border-gray-100 shadow-lg bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Envoyez-nous un message
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Nous vous répondrons dans les 24 heures
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Nom</Label>
                      <Input
                        id="contact-name"
                        name="name"
                        placeholder="Votre nom"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="h-12 border-gray-200 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        name="email"
                        type="email"
                        placeholder="votre@email.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="h-12 border-gray-200 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-subject">Sujet</Label>
                    <Input
                      id="contact-subject"
                      name="subject"
                      placeholder="Sujet de votre message"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="h-12 border-gray-200 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      placeholder="Votre message..."
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="border-gray-200 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      {error}
                    </p>
                  )}
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                    >
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi...</>
                      ) : (
                        <><Send className="mr-2 h-4 w-4" /> Envoyer le message</>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
