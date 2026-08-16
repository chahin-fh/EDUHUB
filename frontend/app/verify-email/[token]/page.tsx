"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { motion } from "framer-motion";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  ArrowLeft,
  PartyPopper,
} from "lucide-react";
import { PageTransition } from "@/components/animated-section";

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  useEffect(() => {
    if (!token) {
      setError("Lien de vérification invalide");
      setIsVerifying(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/auth/verify-email/${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Échec de la vérification");
        }

        setIsVerified(true);
        setMessage(
          "Votre email a été vérifié avec succès ! Vous pouvez maintenant accéder à toutes les fonctionnalités d'EDUHUB."
        );

        // Si l'utilisateur est déjà connecté, mettre à jour son statut local
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            parsed.emailVerified = true;
            localStorage.setItem("user", JSON.stringify(parsed));
          }
        } catch {
          // ignore
        }
      } catch (err: any) {
        setError(
          err.message || "Une erreur est survenue lors de la vérification"
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token]);

  const handleGoToLogin = () => {
    router.push("/connexion");
  };

  if (isVerifying) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
          <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />
          <Card className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-blue-900/10 rounded-3xl">
            <CardContent className="flex flex-col items-center justify-center py-14">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500 font-medium">
                Vérification de votre email...
              </p>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  if (isVerified) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
          <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-green-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="relative w-full max-w-md"
          >
            <Card className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-blue-900/10 rounded-3xl overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardHeader className="text-center pt-10">
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25 mb-2"
                >
                  <PartyPopper className="h-8 w-8 text-white" />
                </motion.div>
                <CardTitle className="text-2xl font-extrabold text-gray-900">
                  Email vérifié !
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Votre compte est maintenant actif et prêt à être utilisé
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 flex items-start gap-3 text-left">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800 text-sm">{message}</p>
                </div>
                <p className="text-gray-500 text-sm">
                  Vous pouvez maintenant vous connecter et profiter de toutes
                  les fonctionnalités d&apos;EDUHUB.
                </p>
              </CardContent>
              <CardFooter className="pb-8">
                <Button
                  onClick={handleGoToLogin}
                  className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all"
                >
                  Se connecter
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-red-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="relative w-full max-w-md"
        >
          <Card className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-blue-900/10 rounded-3xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-pink-500" />
            <CardHeader className="text-center pt-10">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/25 mb-2">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-extrabold text-gray-900">
                Échec de la vérification
              </CardTitle>
              <CardDescription className="text-gray-500">
                Nous n&apos;avons pas pu vérifier votre adresse email
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 flex items-start gap-3 text-left">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
              <p className="text-gray-500 text-sm">
                Le lien de vérification peut être invalide ou expiré. Veuillez
                demander un nouvel email de vérification.
              </p>
            </CardContent>
            <CardFooter className="pb-8 space-y-3 flex-col">
              <Button
                variant="outline"
                onClick={() => router.push("/connexion")}
                className="w-full h-12 rounded-xl border-gray-200 hover:border-blue-400 hover:bg-blue-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Button>
              <Button
                onClick={() => router.push("/resend-verification")}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Mail className="mr-2 h-4 w-4" />
                Renvoyer l&apos;email de vérification
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
