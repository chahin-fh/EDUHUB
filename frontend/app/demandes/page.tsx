"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  X,
  Search,
  Loader2,
  MessageSquare,
  Clock,
  Calendar,
  AlertCircle,
  Send,
  Inbox,
  UserCheck,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatedSection, StaggerContainer, StaggerItem, AnimatedCard, PageTransition } from "@/components/animated-section";
import { toast } from "sonner";

interface MatchRequestData {
  _id: string;
  requester: { _id: string; name: string; username: string; email: string; avatar?: string; };
  mentor: { _id: string; name: string; username: string; email: string; avatar?: string; };
  subject: { _id: string; name: string; slug: string; category?: string; };
  status: "pending" | "accepted" | "declined";
  message: string;
  conversation?: { _id: string; };
  createdAt: string;
}

interface RequestCardProps {
  request: MatchRequestData;
  isSent: boolean;
  processingId: string | null;
  onRespond: (id: string, status: "accepted" | "declined") => void;
  onMessage: () => void;
}

const statusColors = {
  pending: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", badge: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  accepted: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", badge: "bg-green-100 text-green-800 border-green-200", icon: Check },
  declined: { bg: "bg-red-50", border: "border-red-100", text: "text-red-800", badge: "bg-red-100 text-red-800 border-red-200", icon: X },
};

function RequestCard({ request, isSent, processingId, onRespond, onMessage }: RequestCardProps) {
  const person = isSent ? request.mentor : request.requester;
  const statusInfo = statusColors[request.status];
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  };

  return (
    <StaggerItem>
      <AnimatedCard>
        <motion.div
          layout
          className={`rounded-2xl border bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 ${
            request.status === "pending" ? "border-blue-200 ring-1 ring-blue-100" : statusInfo.border
          }`}
        >
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                  <AvatarImage src={person.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {(person.name || person.username || "U").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{person.name || person.username}</h3>
                    <Badge className={`${statusInfo.badge} text-xs`}>
                      {request.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {request.status === "accepted" && <Check className="h-3 w-3 mr-1" />}
                      {request.status === "declined" && <X className="h-3 w-3 mr-1" />}
                      {request.status === "pending" ? "En attente" : request.status === "accepted" ? "Acceptée" : "Refusée"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{request.subject.name}</span>
                    <span className="text-gray-300">•</span>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(request.createdAt)}</span>
                  </div>
                  {request.message && (
                    <p className="text-sm text-gray-600 mt-2 italic line-clamp-2">
                      &ldquo;{request.message}&rdquo;
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isSent && request.status === "pending" && (
                  <>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={() => onRespond(request._id, "accepted")}
                        disabled={processingId === request._id}
                        className="bg-green-600 hover:bg-green-700 gap-2 rounded-xl">
                        {processingId === request._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                        Accepter
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={() => onRespond(request._id, "declined")}
                        disabled={processingId === request._id}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 gap-2 rounded-xl">
                        <X className="h-4 w-4" />
                        Refuser
                      </Button>
                    </motion.div>
                  </>
                )}
                {request.status === "accepted" && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={onMessage} className="gap-2 rounded-xl">
                      <MessageSquare className="h-4 w-4" />
                      Discuter
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </CardContent>
        </motion.div>
      </AnimatedCard>
    </StaggerItem>
  );
}

function EmptyState({ icon: Icon, title, desc, action }: { icon: any; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-gray-200">
      <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{desc}</p>
      {action}
    </motion.div>
  );
}

export default function DemandesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [sentRequests, setSentRequests] = useState<MatchRequestData[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<MatchRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/connexion"); return; }
    fetchRequests();
  }, [isAuthenticated]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/matching/requests", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.status === 401) { router.push("/connexion"); return; }
      const data = await res.json();
      if (data.success) {
        setSentRequests(data.sent || []);
        setReceivedRequests(data.received || []);
      } else setError(data.message || "Erreur");
    } catch (err) {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, status: "accepted" | "declined") => {
    setProcessingId(requestId);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:5000/api/matching/request/${requestId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRequests();
        if (status === "accepted") toast.success("Demande acceptée ! Une conversation a été créée.");
        else if (status === "declined") toast.info("Demande refusée");
      } else toast.error(data.message || "Erreur");
    } catch (err) {
      toast.error("Erreur lors de la réponse");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Mises en relation
            </span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mes demandes
            </h1>
            <p className="text-gray-600 mt-2">Gérez vos demandes de mise en relation</p>
          </AnimatedSection>

          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}

          <Tabs defaultValue="received" className="space-y-6">
            <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1.5 shadow-sm">
              <TabsTrigger value="received"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all">
                <Inbox className="h-4 w-4 mr-2" />
                Reçues
                {receivedRequests.filter(r => r.status === "pending").length > 0 && (
                  <span className="ml-2 bg-red-500 text-white h-5 min-w-[20px] flex items-center justify-center rounded-full text-xs font-bold px-1.5">
                    {receivedRequests.filter(r => r.status === "pending").length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all">
                <Send className="h-4 w-4 mr-2" />
                Envoyées
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received">
              <StaggerContainer className="space-y-4">
                {receivedRequests.length === 0 ? (
                  <EmptyState icon={Inbox} title="Aucune demande reçue"
                    desc="Les demandes des autres étudiants apparaîtront ici" />
                ) : receivedRequests.map(r => (
                  <RequestCard key={r._id} request={r} isSent={false}
                    processingId={processingId} onRespond={handleRespond} onMessage={() => router.push("/messages")} />
                ))}
              </StaggerContainer>
            </TabsContent>

            <TabsContent value="sent">
              <StaggerContainer className="space-y-4">
                {sentRequests.length === 0 ? (
                  <EmptyState icon={Send} title="Aucune demande envoyée"
                    desc="Recherchez des mentors et envoyez-leur une demande"
                    action={<Button onClick={() => router.push("/apprendre")} className="mt-4 gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                      <Search className="h-4 w-4" /> Trouver des mentors
                    </Button>} />
                ) : sentRequests.map(r => (
                  <RequestCard key={r._id} request={r} isSent={true}
                    processingId={processingId} onRespond={handleRespond} onMessage={() => router.push("/messages")} />
                ))}
              </StaggerContainer>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
}
