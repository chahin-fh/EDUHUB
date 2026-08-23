"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  Shield,
  Star,
  UserX,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { API_BASE } from "@/lib/api-config";

interface AdminUser {
  _id: string;
  name?: string;
  username?: string;
  email: string;
  role: "admin" | "user";
  isMonitor: boolean;
  isActive: boolean;
  emailVerified: boolean;
  monitorProfile?: { verified: boolean; rating?: number; expertise?: any[] };
  createdAt?: string;
  avatar?: string;
}

interface Pagination {
  current: number;
  pages: number;
  total: number;
}

export default function UserManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ current: 1, pages: 1, total: 0 });
  const [busyId, setBusyId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("authToken") || "";

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: "20", sortBy: "createdAt", sortOrder: "desc" });
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`${API_BASE}/api/usersList?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(res.status === 429 ? "Trop de requêtes, patientez un instant" : `Erreur ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setPagination(data.pagination || { current: 1, pages: 1, total: 0 });
        setError("");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de chargement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const runAction = async (user: AdminUser, body: Record<string, unknown>, successMsg: string) => {
    setBusyId(user._id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      toast.success(successMsg, { duration: 3000 });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Erreur", { duration: 4000 });
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (!confirm(`Supprimer (désactiver) ${user.name || user.username || user.email} ?`)) return;
    setBusyId(user._id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${user._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      toast.success(data.message || "Utilisateur supprimé", { duration: 3000 });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Erreur", { duration: 4000 });
    } finally {
      setBusyId(null);
    }
  };

  const isAdmin = (u: AdminUser) => u.role === "admin";

  return (
    <div className="space-y-6">
      <Card className="border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  {pagination.total} utilisateurs — suspendre, promouvoir, vérifier, supprimer
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setPage(1); fetchUsers(); }} className="gap-2 border-gray-200 rounded-xl">
              <RefreshCw className="h-4 w-4" /> Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email..."
                className="pl-9 rounded-xl border-gray-200"
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:ring-blue-500"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            >
              <option value="">Tous les rôles</option>
              <option value="monitor">Moniteurs</option>
              <option value="user">Utilisateurs</option>
              <option value="admin">Admins</option>
            </select>
            <select
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Suspendus</option>
              <option value="verified">Email vérifié</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          {/* Liste */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-gray-500">Aucun utilisateur trouvé</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-3 py-2">Utilisateur</th>
                    <th className="px-3 py-2">Rôle</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => {
                    const busy = busyId === u._id;
                    return (
                      <tr key={u._id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {(u.name || u.username || u.email || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate flex items-center gap-1.5">
                                {u.name || u.username}
                                {u.monitorProfile?.verified && (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                )}
                              </div>
                              <div className="text-xs text-gray-400 flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3" /> {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {isAdmin(u) && <Badge className="bg-red-100 text-red-800 border-red-200">Admin</Badge>}
                            {u.isMonitor && <Badge className="bg-blue-100 text-blue-800 border-blue-200">Moniteur</Badge>}
                            {!isAdmin(u) && !u.isMonitor && (
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200">Utilisateur</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.isActive ? "text-green-600" : "text-red-500"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-green-500" : "bg-red-500"}`} />
                              {u.isActive ? "Actif" : "Suspendu"}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-xs ${u.emailVerified ? "text-blue-600" : "text-gray-400"}`}>
                              {u.emailVerified ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              Email {u.emailVerified ? "vérifié" : "non vérifié"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {!isAdmin(u) && (
                              <>
                                <Button
                                  variant="ghost" size="sm"
                                  disabled={busy}
                                  onClick={() =>
                                    runAction(u, { isActive: !u.isActive }, u.isActive ? "Utilisateur suspendu" : "Utilisateur réactivé")
                                  }
                                  className={`gap-1 rounded-lg text-xs ${u.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}
                                >
                                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : u.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                                  {u.isActive ? "Suspendre" : "Réactiver"}
                                </Button>
                                <Button
                                  variant="ghost" size="sm" disabled={busy}
                                  onClick={() =>
                                    runAction(u, { isMonitor: !u.isMonitor }, u.isMonitor ? "Statut moniteur retiré" : "Promu moniteur")
                                  }
                                  className="gap-1 rounded-lg text-xs text-blue-600 hover:bg-blue-50"
                                >
                                  {u.isMonitor ? "Retirer moniteur" : "Promouvoir moniteur"}
                                </Button>
                                {u.isMonitor && (
                                  <Button
                                    variant="ghost" size="sm" disabled={busy}
                                    onClick={() =>
                                      runAction(u, { monitorVerified: !u.monitorProfile?.verified }, u.monitorProfile?.verified ? "Vérification retirée" : "Mentor vérifié ✓")
                                    }
                                    className="gap-1 rounded-lg text-xs text-amber-600 hover:bg-amber-50"
                                  >
                                    {u.monitorProfile?.verified ? "Retirer vérif." : "Vérifier mentor"}
                                  </Button>
                                )}
                                {!u.emailVerified && (
                                  <Button
                                    variant="ghost" size="sm" disabled={busy}
                                    onClick={() => runAction(u, { emailVerified: true }, "Email vérifié manuellement")}
                                    className="gap-1 rounded-lg text-xs text-purple-600 hover:bg-purple-50"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Vérifier email
                                  </Button>
                                )}
                                <Button
                                  variant="ghost" size="sm" disabled={busy}
                                  onClick={() => deleteUser(u)}
                                  className="gap-1 rounded-lg text-xs text-gray-500 hover:bg-red-50 hover:text-red-600"
                                >
                                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                  Supprimer
                                </Button>
                              </>
                            )}
                            {isAdmin(u) && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Star className="h-3.5 w-3.5" /> Compte protégé
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border-gray-200">
                Précédent
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} / {pagination.pages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border-gray-200">
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
