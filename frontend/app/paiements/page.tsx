"use client";

// =====================================================================
// ⚠️ PAGE DES PAIEMENTS — CODE COMMENTÉ
// ---------------------------------------------------------------------
// La partie paiement a été mise en commentaire sur demande.
// Le code original est conservé ci-dessous en commentaire.
// Pour réactiver : retirez les marqueurs de commentaire ci-dessous.
// =====================================================================

// 
// "use client";
// 
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/contexts/AuthContext";
// import { motion } from "framer-motion";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   CreditCard,
//   ArrowLeft,
//   Loader2,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   FileText,
//   ExternalLink,
//   AlertCircle,
//   Sparkles,
// } from "lucide-react";
// import Link from "next/link";
// import { PageTransition, AnimatedSection } from "@/components/animated-section";
// 
// interface Payment {
//   _id: string;
//   course: {
//     _id: string;
//     title?: string;
//     courseName?: string;
//     thumbnail?: string;
//     price?: number;
//     discountPrice?: number;
//     category?: string;
//   } | null;
//   amountPaid: number;
//   paymentStatus: "completed" | "pending" | "refunded";
//   paymentMethod: string;
//   transactionId: string;
//   paymentDate: string;
//   status: string;
//   completionPercentage: number;
// }
// 
// export default function PaiementsPage() {
//   const { user, isLoading, isAuthenticated } = useAuth();
//   const router = useRouter();
//   const [payments, setPayments] = useState<Payment[]>([]);
//   const [fetchLoading, setFetchLoading] = useState(true);
//   const [error, setError] = useState("");
// 
//   useEffect(() => {
//     if (!isLoading && !isAuthenticated) {
//       router.push("/connexion");
//       return;
//     }
//     if (isAuthenticated && user) {
//       fetchPayments();
//     }
//   }, [isLoading, isAuthenticated, user]);
// 
//   const fetchPayments = async () => {
//     try {
//       setFetchLoading(true);
//       const token = localStorage.getItem("authToken");
//       const res = await fetch("http://localhost:5000/api/payment/history", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("Erreur lors du chargement");
//       const data = await res.json();
//       setPayments(data.payments || []);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Erreur de chargement");
//     } finally {
//       setFetchLoading(false);
//     }
//   };
// 
//   const getStatusIcon = (status: Payment["paymentStatus"]) => {
//     switch (status) {
//       case "completed":
//         return <CheckCircle2 className="h-5 w-5 text-green-500" />;
//       case "pending":
//         return <Clock className="h-5 w-5 text-amber-500" />;
//       case "refunded":
//         return <XCircle className="h-5 w-5 text-red-500" />;
//     }
//   };
// 
//   const getStatusLabel = (status: Payment["paymentStatus"]) => {
//     switch (status) {
//       case "completed":
//         return "Payé";
//       case "pending":
//         return "En attente";
//       case "refunded":
//         return "Remboursé";
//     }
//   };
// 
//   const getStatusColor = (status: Payment["paymentStatus"]) => {
//     switch (status) {
//       case "completed":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "pending":
//         return "bg-amber-100 text-amber-800 border-amber-200";
//       case "refunded":
//         return "bg-red-100 text-red-800 border-red-200";
//     }
//   };
// 
//   const formatDate = (dateStr: string) => {
//     try {
//       return new Date(dateStr).toLocaleDateString("fr-FR", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch {
//       return dateStr;
//     }
//   };
// 
//   const formatPrice = (amount: number) => {
//     return `${amount.toFixed(2)} €`;
//   };
// 
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-500">Chargement...</p>
//         </div>
//       </div>
//     );
//   }
// 
//   if (!isAuthenticated) return null;
// 
//   return (
//     <PageTransition>
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           {/* Header */}
//           <AnimatedSection>
//             <Link
//               href="/dashboard"
//               className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               Retour au tableau de bord
//             </Link>
// 
//             <div className="flex items-center gap-3 mb-8">
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg"
//               >
//                 <CreditCard className="h-6 w-6 text-white" />
//               </motion.div>
//               <div>
//                 <motion.span
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-2"
//                 >
//                   <Sparkles className="w-4 h-4" />
//                   Paiements
//                 </motion.span>
//                 <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   Historique des paiements
//                 </h1>
//                 <p className="text-gray-500 mt-1">
//                   Consultez l&apos;historique de vos achats de cours
//                 </p>
//               </div>
//             </div>
//           </AnimatedSection>
// 
//           {/* Content */}
//           {fetchLoading ? (
//             <div className="flex justify-center py-20">
//               <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
//             </div>
//           ) : error ? (
//             <Card className="border-red-200 bg-red-50/50">
//               <CardContent className="p-8 text-center">
//                 <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
//                 <p className="text-red-600 font-medium">{error}</p>
//                 <Button
//                   onClick={fetchPayments}
//                   variant="outline"
//                   className="mt-4"
//                 >
//                   Réessayer
//                 </Button>
//               </CardContent>
//             </Card>
//           ) : payments.length === 0 ? (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//             >
//               <Card className="border-dashed border-2 border-gray-300 bg-white/50">
//                 <CardContent className="p-16 text-center">
//                   <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     transition={{ delay: 0.2, type: "spring" }}
//                   >
//                     <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//                   </motion.div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                     Aucun paiement
//                   </h3>
//                   <p className="text-gray-500 mb-6">
//                     Vous n&apos;avez pas encore effectué d&apos;achat sur la
//                     plateforme.
//                   </p>
//                   <Button
//                     onClick={() => router.push("/cours")}
//                     className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
//                   >
//                     Parcourir les cours
//                   </Button>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ) : (
//             <div className="space-y-4">
//               {payments.map((payment, index) => (
//                 <motion.div
//                   key={payment._id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.05 }}
//                 >
//                   <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200/80 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden">
//                     <CardContent className="p-6">
//                       <div className="flex flex-col lg:flex-row lg:items-center gap-4">
//                         {/* Course Info */}
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-start gap-4">
//                             <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex-shrink-0">
//                               <FileText className="h-6 w-6 text-blue-600" />
//                             </div>
//                             <div className="min-w-0">
//                               <Link
//                                 href={`/cours/${payment.course?._id || ""}`}
//                                 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
//                               >
//                                 {payment.course?.title ||
//                                   payment.course?.courseName ||
//                                   "Cours supprimé"}
//                               </Link>
//                               {payment.course?.category && (
//                                 <p className="text-sm text-gray-500 mt-1">
//                                   {payment.course.category}
//                                 </p>
//                               )}
//                               <div className="flex flex-wrap items-center gap-3 mt-2">
//                                 <Badge
//                                   variant="outline"
//                                   className={`${getStatusColor(
//                                     payment.paymentStatus
//                                   )} gap-1`}
//                                 >
//                                   {getStatusIcon(payment.paymentStatus)}
//                                   {getStatusLabel(payment.paymentStatus)}
//                                 </Badge>
//                                 <span className="text-xs text-gray-400">
//                                   {formatDate(payment.paymentDate)}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
// 
//                         {/* Amount & Actions */}
//                         <div className="flex items-center gap-4 lg:flex-shrink-0">
//                           <div className="text-right">
//                             <p className="text-2xl font-bold text-gray-900">
//                               {formatPrice(payment.amountPaid || 0)}
//                             </p>
//                             {payment.paymentMethod && (
//                               <p className="text-xs text-gray-500 capitalize">
//                                 {payment.paymentMethod}
//                               </p>
//                             )}
//                           </div>
//                           {payment.course?._id && (
//                             <Link
//                               href={`/cours/${payment.course._id}`}
//                             >
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="gap-2 rounded-xl"
//                               >
//                                 <ExternalLink className="h-4 w-4" />
//                                 Voir le cours
//                               </Button>
//                             </Link>
//                           )}
//                         </div>
//                       </div>
// 
//                       {/* Progress bar */}
//                       {payment.status === "active" && (
//                         <div className="mt-4 pt-4 border-t border-gray-100">
//                           <div className="flex items-center justify-between text-sm mb-1.5">
//                             <span className="text-gray-600">Progression</span>
//                             <span className="font-semibold text-gray-900">
//                               {payment.completionPercentage || 0}%
//                             </span>
//                           </div>
//                           <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
//                             <motion.div
//                               initial={{ width: 0 }}
//                               animate={{
//                                 width: `${payment.completionPercentage || 0}%`,
//                               }}
//                               transition={{ duration: 1, delay: 0.3 }}
//                               className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
//                             />
//                           </div>
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </PageTransition>
//   );
// }
// Page désactivée (partie paiement commentée) : /paiements reste
// accessible mais n'affiche plus rien.
export default function PaiementsPage() {
  return null;
}
