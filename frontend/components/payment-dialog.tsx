"use client";

// =====================================================================
// ⚠️ DIALOGUE DE PAIEMENT — CODE COMMENTÉ
// ---------------------------------------------------------------------
// La partie paiement a été mise en commentaire sur demande.
// Le code original est conservé ci-dessous en commentaire.
// Pour réactiver : retirez les marqueurs de commentaire ci-dessous
// et réactivez les imports/usages dans les pages qui l'utilisent.
// =====================================================================

/*
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CreditCard,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE =  https://eduhub-for-production.onrender.com

interface PaidCourse {
  _id: string;
  title?: string;
  courseName?: string;
  price?: number;
  discountPrice?: number;
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Dialogue de paiement : liste les cours payants et permet d'acheter
// directement (via Stripe) pour débloquer le contact avec les moniteurs.
export default function PaymentDialog({
  open,
  onOpenChange,
}: PaymentDialogProps) {
  const [courses, setCourses] = useState<PaidCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/courses`);
      if (!res.ok) {
        throw new Error("Erreur lors du chargement des cours");
      }
      const data = await res.json();
      const paid = (data.courses || []).filter(
        (c: any) =>
          c.price !== undefined &&
          c.price !== null &&
          Number(c.price) > 0 &&
          (c.status === "published" || c.status === "active")
      );
      setCourses(paid);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadCourses();
  }, [open]);

  const handlePay = async (courseId: string) => {
    try {
      setPayingId(courseId);
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${API_BASE}/api/payment/create-checkout-session`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur de paiement");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors du paiement"
      );
    } finally {
      setPayingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg z-[10000]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
              <CreditCard className="h-4 w-4 text-white" />
            </span>
            Payer pour contacter les moniteurs
          </DialogTitle>
          <DialogDescription>
            Choisissez un cours payant : votre paiement débloque le contact
            avec les moniteurs.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={loadCourses}
            >
              Réessayer
            </Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8">
            <Lock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              Aucun cours payant disponible pour le moment.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/70 p-4 hover:border-amber-300 hover:bg-amber-50/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {course.title || course.courseName}
                    </p>
                    <p className="text-sm font-bold text-blue-600 mt-0.5">
                      {course.discountPrice || course.price} €
                    </p>
                  </div>
                  <Button
                    onClick={() => handlePay(course._id)}
                    disabled={payingId === course._id}
                    size="sm"
                    className="flex-shrink-0 gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  >
                    {payingId === course._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    Payer
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
              <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Paiement sécurisé par Stripe. Vous serez redirigé pour
                finaliser l&apos;achat.
              </span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
*/

// Composant désactivé (partie paiement commentée)
export default function PaymentDialog() {
  return null;
}
