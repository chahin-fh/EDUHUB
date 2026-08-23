"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Loader2, Search, Trash2, AlertCircle, RefreshCw, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { timeAgo } from "@/lib/utils";

const API_BASE =  https://eduhub-for-production.onrender.com

interface ReviewItem {
  _id: string;
  from?: { _id: string; name?: string; username?: string; email?: string; avatar?: string };
  to?: { _id: string; name?: string; username?: string; email?: string; avatar?: string };
  subject?: { _id: string; name?: string };
  rating: number;
  comment?: string;
  createdAt: string;
}

interface Pagination {
  current: number;
  pages: number;
  total: number;
}

function displayName(u?: { name?: string; username?: string; email?: string }) {
  return u?.name || u?.username || u?.email || "Utilisateur";
}

function initials(u?: { name?: string; username?: string; email?: string }) {
  return displayName(u).charAt(0).toUpperCase();
}

export default function ReviewManager() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ current: 1, pages: 1, total: 0 });
  const [busyId, setBusyId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("authToken") || "";

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (search) params.append("search", search);
      const res = await fetch(`${API_BASE}/api/admin/reviews?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(res.status === 429 ? "Trop de requêtes, patientez un instant" : `Erreur ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        setPagination(data.pagination || { current: 1, pages: 1, total: 0 });
        setError("");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de chargement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const deleteReview = async (review: ReviewItem) => {
    if (!confirm(`Supprimer l'avis de ${displayName(review.from)} (${review.rating}★) ?`)) return;
    setBusyId(review._id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/reviews/${review._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      toast.success("Avis supprimé", { duration: 3000 });
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message || "Erreur", { duration: 4000 });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card className="border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <MessageSquare className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle>Modération des avis</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">{pagination.total} avis publiés — supprimez les contenus abusifs</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setPage(1); fetchReviews(); }} className="gap-2 border-gray-200 rounded-xl">
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par auteur ou destinataire..."
            className="pl-9 rounded-xl border-gray-200"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-gray-500">Aucun avis trouvé</div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => {
              const busy = busyId === r._id;
              return (
                <div key={r._id} className="flex items-start gap-4 rounded-xl border border-gray-100 p-4 hover:bg-amber-50/30 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {initials(r.from)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{displayName(r.from)}</span>
                      <span className="text-gray-400 text-sm">→</span>
                      <span className="font-medium text-gray-700">{displayName(r.to)}</span>
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                        ))}
                      </span>
                      {r.subject?.name && (
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {r.subject.name}
                        </Badge>
                      )}
                    </div>
                    {r.comment && (
                      <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{r.comment}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1.5">{timeAgo(r.createdAt)}</p>
                  </div>
                  <Button
                    variant="ghost" size="sm" disabled={busy}
                    onClick={() => deleteReview(r)}
                    className="gap-1 rounded-lg text-xs text-gray-500 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                  >
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Supprimer
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border-gray-200">
              Précédent
            </Button>
            <span className="text-sm text-gray-500">Page {page} / {pagination.pages}</span>
            <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border-gray-200">
              Suivant
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
