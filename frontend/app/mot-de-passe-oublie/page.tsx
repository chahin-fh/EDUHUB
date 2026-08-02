"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Loader2,
  Mail,
  ArrowLeft,
  KeyRound,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { PageTransition } from "@/components/animated-section";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue");
      }

      setMessage(
        "Un email de réinitialisation a été envoyé à votre adresse email."
      );
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
      console.error("Forgot password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        {/* Décorations de fond */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 rounded-full bg-pink-200/25 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="relative w-full max-w-md"
        >
          <Card className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-blue-900/10 rounded-3xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            <CardHeader className="space-y-2 text-center pt-10">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/25 mb-2">
                <KeyRound className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-extrabold text-gray-900">
                Mot de passe oublié
              </CardTitle>
              <CardDescription className="text-gray-500">
                Entrez votre adresse email pour recevoir un lien de
                réinitialisation
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {message && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800">{message}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading || !!message}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all"
                    disabled={isLoading || !!message}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-5 w-5" />
                        Envoyer le lien
                      </>
                    )}
                  </Button>
                </motion.div>

                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-gray-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Le lien sera valide pendant 10 minutes
                </div>
              </CardContent>
            </form>

            <CardFooter className="justify-center pb-8">
              <Link
                href="/connexion"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Retour à la connexion
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
