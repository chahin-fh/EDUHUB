"use client";

// =====================================================================
// ⚠️ GESTIONNAIRE DE PAIEMENTS (ADMIN) — CODE COMMENTÉ
// ---------------------------------------------------------------------
// La partie paiement a été mise en commentaire sur demande.
// Le code original est conservé ci-dessous en commentaire.
// Pour réactiver : retirez les marqueurs de commentaire ci-dessous
// et réactivez l'import/l'onglet dans app/admin/page.tsx.
// =====================================================================

// 
// "use client";
// 
// import { useCallback, useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { CreditCard, Loader2, RefreshCw, AlertCircle, TrendingUp, Undo2, Banknote, Receipt } from "lucide-react";
// import { toast } from "sonner";
// import { timeAgo } from "@/lib/utils";
// 
// const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
// 
// interface PaymentItem {
//   _id: string;
//   student?: { _id: string; name?: string; username?: string; email?: string };
//   course?: { _id: string; title?: string; courseName?: string; category?: string };
//   amountPaid?: number;
//   paymentStatus: "completed" | "pending" | "refunded" | "failed";
//   paymentMethod?: string;
//   transactionId?: string;
//   paymentDate?: string;
//   enrolledAt?: string;
// }
// 
// interface Pagination {
//   current: number;
//   pages: number;
//   total: number;
// }
// 
// const statusStyle: Record<string, { label: string; cls: string }> = {
//   completed: { label: "Payé", cls: "bg-green-100 text-green-800 border-green-200" },
//   pending: { label: "En attente", cls: "bg-amber-100 text-amber-800 border-amber-200" },
//   refunded: { label: "Remboursé", cls: "bg-purple-100 text-purple-800 border-purple-200" },
//   failed: { label: "Échoué", cls: "bg-red-100 text-red-800 border-red-200" },
// };
// 
// export default function PaymentManager() {
//   const [payments, setPayments] = useState<PaymentItem[]>([]);
//   const [revenue, setRevenue] = useState<{ completed: number; refunded: number }>({ completed: 0, refunded: 0 });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [page, setPage] = useState(1);
//   const [pagination, setPagination] = useState<Pagination>({ current: 1, pages: 1, total: 0 });
// 
//   const getToken = () => localStorage.getItem("authToken") || "";
// 
//   const fetchPayments = useCallback(async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams({ page: page.toString(), limit: "20" });
//       if (statusFilter) params.append("status", statusFilter);
//       const res = await fetch(`${API_BASE}/api/admin/payments?${params}`, {
//         headers: { Authorization: `Bearer ${getToken()}` },
//       });
//       if (!res.ok) throw new Error(res.status === 429 ? "Trop de requêtes, patientez un instant" : `Erreur ${res.status}`);
//       const data = await res.json();
//       if (data.success) {
//         setPayments(data.payments || []);
//         setPagination(data.pagination || { current: 1, pages: 1, total: 0 });
//         setRevenue(data.revenue || { completed: 0, refunded: 0 });
//         setError("");
//       }
//     } catch (err: any) {
//       setError(err.message || "Erreur de chargement");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, statusFilter]);
// 
//   useEffect(() => {
//     fetchPayments();
//   }, [fetchPayments]);
// 
//   const formatEUR = (n?: number) =>
//     `${(n || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
// 
//   const summaryCards = [
//     {
//       label: "Revenus encaissés",
//       value: formatEUR(revenue.completed),
//       icon: TrendingUp,
//       color: "from-green-500 to-emerald-600",
//     },
//     {
//       label: "Remboursements",
//       value: formatEUR(revenue.refunded),
//       icon: Undo2,
//       color: "from-purple-500 to-purple-600",
//     },
//     {
//       label: "Transactions",
//       value: pagination.total.toString(),
//       icon: Receipt,
//       color: "from-blue-500 to-blue-600",
//     },
//   ];
// 
//   return (
//     <div className="space-y-6">
//       {/* Cartes de synthèse */}
//       <div className="grid gap-4 md:grid-cols-3">
//         {summaryCards.map(({ label, value, icon: Icon, color }) => (
//           <Card key={label} className="border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
//             <CardContent className="p-5">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">{label}</p>
//                   <p className="text-2xl font-bold text-gray-900">{value}</p>
//                 </div>
//                 <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
//                   <Icon className="h-5 w-5 text-white" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
// 
//       <Card className="border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
//         <CardHeader className="border-b border-gray-100">
//           <div className="flex items-center justify-between flex-wrap gap-3">
//             <div className="flex items-center gap-3">
//               <div className="p-2 rounded-lg bg-green-100">
//                 <CreditCard className="h-5 w-5 text-green-600" />
//               </div>
//               <div>
//                 <CardTitle>Historique des paiements</CardTitle>
//                 <p className="text-sm text-gray-500 mt-0.5">Toutes les transactions Stripe de la plateforme</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <select
//                 className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-blue-500"
//                 value={statusFilter}
//                 onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
//               >
//                 <option value="">Tous les statuts</option>
//                 <option value="completed">Payés</option>
//                 <option value="pending">En attente</option>
//                 <option value="refunded">Remboursés</option>
//                 <option value="failed">Échoués</option>
//               </select>
//               <Button variant="outline" size="sm" onClick={() => { setPage(1); fetchPayments(); }} className="gap-2 border-gray-200 rounded-xl">
//                 <RefreshCw className="h-4 w-4" /> Actualiser
//               </Button>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="p-4">
//           {error && (
//             <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
//               <AlertCircle className="h-4 w-4" /> {error}
//             </div>
//           )}
// 
//           {loading ? (
//             <div className="flex justify-center py-12">
//               <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//             </div>
//           ) : payments.length === 0 ? (
//             <div className="py-12 text-center text-gray-500">Aucune transaction trouvée</div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-400">
//                     <th className="px-3 py-2">Étudiant</th>
//                     <th className="px-3 py-2">Cours</th>
//                     <th className="px-3 py-2">Montant</th>
//                     <th className="px-3 py-2">Statut</th>
//                     <th className="px-3 py-2">Méthode</th>
//                     <th className="px-3 py-2">Date</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-50">
//                   {payments.map((p) => {
//                     const st = statusStyle[p.paymentStatus] || statusStyle.pending;
//                     return (
//                       <tr key={p._id} className="hover:bg-green-50/30 transition-colors">
//                         <td className="px-3 py-3">
//                           <div className="flex items-center gap-2">
//                             <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
//                               {(p.student?.name || p.student?.username || p.student?.email || "?").charAt(0).toUpperCase()}
//                             </div>
//                             <div className="min-w-0">
//                               <div className="font-medium text-gray-900 truncate max-w-[140px]">
//                                 {p.student?.name || p.student?.username || p.student?.email}
//                               </div>
//                               {p.transactionId && (
//                                 <div className="text-[11px] text-gray-400 truncate max-w-[140px] flex items-center gap-1">
//                                   <Banknote className="h-3 w-3" /> {p.transactionId.slice(0, 14)}…
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-3 py-3">
//                           <div className="text-gray-900 truncate max-w-[200px]">
//                             {p.course?.title || p.course?.courseName || "—"}
//                           </div>
//                           {p.course?.category && (
//                             <div className="text-xs text-gray-400">{p.course.category}</div>
//                           )}
//                         </td>
//                         <td className="px-3 py-3 font-semibold text-gray-900">{formatEUR(p.amountPaid)}</td>
//                         <td className="px-3 py-3">
//                           <Badge className={st.cls}>{st.label}</Badge>
//                         </td>
//                         <td className="px-3 py-3 text-gray-500 capitalize">{p.paymentMethod || "—"}</td>
//                         <td className="px-3 py-3 text-xs text-gray-400">{timeAgo(p.paymentDate || p.enrolledAt)}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
// 
//           {pagination.pages > 1 && (
//             <div className="flex items-center justify-center gap-2 pt-4">
//               <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border-gray-200">
//                 Précédent
//               </Button>
//               <span className="text-sm text-gray-500">Page {page} / {pagination.pages}</span>
//               <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border-gray-200">
//                 Suivant
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
// Composant désactivé (partie paiement commentée)
export default function PaymentManager() {
  return null;
}
