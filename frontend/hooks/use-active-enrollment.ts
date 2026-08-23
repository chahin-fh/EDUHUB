"use client";

// =====================================================================
// ⚠️ PARTIE PAIEMENT — CODE COMMENTÉ (restriction « payer pour contacter
// les moniteurs »)
// ---------------------------------------------------------------------
// La restriction a été supprimée : tout utilisateur authentifié peut
// désormais contacter les moniteurs sans avoir payé.
// Pour réactiver : retirez les marqueurs de commentaire ci-dessous.
// =====================================================================

import { useAuth } from "@/contexts/AuthContext";

/*
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE ="https://eduhub-for-production.onrender.com";

// Détermine si l'utilisateur peut contacter des moniteurs :
// - les admins sont toujours autorisés
// - les autres doivent avoir PAYÉ pour au moins un cours
//   (paiement complété avec montant > 0), cohérent avec le backend
export function useCanContactMonitors() {
  const { isAuthenticated, user } = useAuth();
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  const isPrivileged = !!user && user.role === "admin";

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setHasPaid(false);
      setLoading(false);
      return;
    }

    if (isPrivileged) {
      setHasPaid(true);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API_BASE}/api/payment/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const payments = data.payments || [];
          if (!cancelled) {
            setHasPaid(
              payments.some(
                (p: any) =>
                  p.paymentStatus === "completed" && (p.amountPaid || 0) > 0
              )
            );
          }
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isPrivileged]);

  return {
    canContactMonitors: isPrivileged ? true : hasPaid,
    loading,
  };
}
*/

// Nouveau comportement : tout utilisateur authentifié peut contacter les moniteurs
export function useCanContactMonitors() {
  const { isAuthenticated } = useAuth();

  return {
    canContactMonitors: isAuthenticated,
    loading: false,
  };
}
