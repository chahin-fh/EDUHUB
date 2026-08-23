"use client";

import { API_BASE } from "@/lib/api-config";

import { useState } from "react";
import { MailWarning, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmailVerificationBannerProps {
  email?: string;
  className?: string;
}

export default function EmailVerificationBanner({
  email,
  className,
}: EmailVerificationBannerProps) {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    if (!email) return;
    setIsSending(true);
    setError("");
    setSent(false);
    try {
      const response = await fetch(
        `${API_BASE}/api/auth/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Échec de l'envoi de l'email");
      }
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Alert className={cn("border-amber-200 bg-amber-50/80", className)}>
      <MailWarning className="text-amber-600" />
      <AlertTitle className="text-amber-800">
        Votre email n&apos;est pas encore vérifié
      </AlertTitle>
      <AlertDescription>
        <p className="text-amber-700">
          Certaines actions (créer un cours, envoyer des messages, devenir
          moniteur, poster des avis…) sont limitées tant que votre adresse
          email n&apos;est pas confirmée.
        </p>
        {sent ? (
          <span className="inline-flex items-center gap-1.5 text-green-700 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Email de vérification envoyé ! Consultez votre boîte de réception.
          </span>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleResend}
            disabled={isSending}
            className="mt-2 border-amber-300 bg-white text-amber-800 hover:bg-amber-100 hover:text-amber-900 rounded-lg"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Renvoyer l&apos;email de vérification
              </>
            )}
          </Button>
        )}
        {error && <p className="mt-1.5 text-red-600 text-xs">{error}</p>}
      </AlertDescription>
    </Alert>
  );
}
