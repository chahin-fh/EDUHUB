"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Mail,
  Calendar,
  AlertCircle,
  Send,
  Inbox,
  UserCheck,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MatchRequestData {
  _id: string;
  requester: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  mentor: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  subject: {
    _id: string;
    name: string;
    slug: string;
    category?: string;
  };
  status: "pending" | "accepted" | "declined";
  message: string;
  conversation?: { _id: string };
  createdAt: string;
}

export default function DemandesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sentRequests, setSentRequests] = useState<MatchRequestData[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<MatchRequestData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }
    fetchRequests();
  }, [isAuthenticated]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        "http://localhost:5000/api/matching/requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 401) {
        router.push("/connexion");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setSentRequests(data.sent || []);
        setReceivedRequests(data.received || []);
      } else {
        setError(data.message || "Erreur lors du chargement");
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (
    requestId: string,
    status: "accepted" | "declined"
  ) => {
    try {
      setProcessingId(requestId);
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `http://localhost:5000/api/matching/request/${requestId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      if (data.success) {
        // Refresh the list
        fetchRequests();
        if (status === "accepted") {
          alert("Demande acceptée ! Une conversation a été créée.");
        }
      } else {
        alert(data.message || "Erreur lors de la réponse");
      }
    } catch (err) {
      console.error("Error responding:", err);
      alert("Erreur lors de la réponse");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            Acceptée
          </Badge>
        );
      case "declined":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <X className="h-3 w-3 mr-1" />
            Refusée
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mes demandes
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos demandes de mise en relation
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
            <TabsTrigger
              value="received"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Inbox className="h-4 w-4 mr-2" />
              Reçues
              {receivedRequests.filter((r) => r.status === "pending").length >
                0 && (
                <Badge className="ml-2 bg-red-500 text-white h-5 min-w-[20px] flex items-center justify-center text-xs">
                  {
                    receivedRequests.filter((r) => r.status === "pending")
                      .length
                  }
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Envoyées
            </TabsTrigger>
          </TabsList>

          {/* Received Requests */}
          <TabsContent value="received" className="space-y-4">
            {receivedRequests.length === 0 ? (
              <div className="text-center py-16 bg-white/50 rounded-xl border border-dashed border-gray-300">
                <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Aucune demande reçue
                </h3>
                <p className="text-gray-500 mt-1">
                  Les demandes des autres étudiants apparaîtront ici
                </p>
              </div>
            ) : (
              receivedRequests.map((request) => (
                <Card
                  key={request._id}
                  className={`bg-white/80 backdrop-blur-sm border shadow-lg ${
                    request.status === "pending"
                      ? "border-blue-200 ring-1 ring-blue-100"
                      : "border-gray-200"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                          <AvatarImage src={request.requester.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {(
                              request.requester.name ||
                              request.requester.username ||
                              "U"
                            ).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">
                              {request.requester.name ||
                                request.requester.username}
                            </h3>
                            {getStatusBadge(request.status)}
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
                        {request.status === "pending" && (
                          <>
                            <Button
                              onClick={() =>
                                handleRespond(request._id, "accepted")
                              }
                              disabled={processingId === request._id}
                              className="bg-green-600 hover:bg-green-700 gap-2"
                            >
                              {processingId === request._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                              Accepter
                            </Button>
                            <Button
                              onClick={() =>
                                handleRespond(request._id, "declined")
                              }
                              disabled={processingId === request._id}
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                            >
                              <X className="h-4 w-4" />
                              Refuser
                            </Button>
                          </>
                        )}
                        {request.status === "accepted" && (
                          <Button
                            onClick={() => router.push("/messages")}
                            className="gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Discuter
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Sent Requests */}
          <TabsContent value="sent" className="space-y-4">
            {sentRequests.length === 0 ? (
              <div className="text-center py-16 bg-white/50 rounded-xl border border-dashed border-gray-300">
                <Send className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Aucune demande envoyée
                </h3>
                <p className="text-gray-500 mt-1">
                  Recherchez des mentors et envoyez-leur une demande
                </p>
                <Button
                  onClick={() => router.push("/apprendre")}
                  className="mt-4 gap-2"
                >
                  <Search className="h-4 w-4" />
                  Trouver des mentors
                </Button>
              </div>
            ) : (
              sentRequests.map((request) => (
                <Card
                  key={request._id}
                  className={`bg-white/80 backdrop-blur-sm border shadow-lg ${
                    request.status === "accepted"
                      ? "border-green-200"
                      : request.status === "declined"
                      ? "border-gray-200 opacity-70"
                      : "border-blue-200"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 ring-2 ring-purple-100">
                          <AvatarImage src={request.mentor.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            {(
                              request.mentor.name ||
                              request.mentor.username ||
                              "U"
                            ).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">
                              {request.mentor.name || request.mentor.username}
                            </h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>{request.subject.name}</span>
                            <span className="text-gray-300">•</span>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(request.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {request.status === "accepted" && (
                          <Button
                            onClick={() => router.push("/messages")}
                            className="gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Discuter
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
