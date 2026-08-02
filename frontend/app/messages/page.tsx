"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  MoreVertical,
  Search,
  Phone,
  Video,
  Loader2,
  MessageSquare,
  ChevronLeft,
  Check,
  CheckCheck,
  Smile,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { WebRTCCall } from "@/components/webrtc-call";
import {
  EmojiPicker,
  groupReactions,
  type MessageReaction,
} from "@/components/chat-emoji-picker";
import { toast } from "sonner";
import { PageTransition, AnimatedSection } from "@/components/animated-section";

interface Participant {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

interface Conversation {
  _id: string;
  type: "direct" | "group";
  participants: Participant[];
  lastMessage?: {
    _id: string;
    text: string;
    sender: { _id: string; name: string };
    createdAt: string;
  };
  lastMessageAt: string;
  createdAt: string;
}

interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
  readBy?: string[];
  status?: "sent" | "seen";
  reactions?: MessageReaction[];
}

export default function MessagesPage() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [callUserId, setCallUserId] = useState<string | null>(null);
  const [callUserName, setCallUserName] = useState("");
  const [callUserAvatar, setCallUserAvatar] = useState("");
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ouvrir directement une conversation avec un utilisateur passé en query (?user=id)
  const openConversationWithUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/chat/conversations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error(
          "Erreur création conversation:",
          data.message || data.error || res.statusText
        );
        return;
      }

      const data = await res.json();
      const conversation: Conversation = data.conversation;
      if (!conversation?._id) return;

      // Ajouter la conversation à la liste si absente, puis la sélectionner
      setConversations((prev) =>
        prev.some((c) => c._id === conversation._id)
          ? prev
          : [conversation, ...prev]
      );
      setSelectedConversation(conversation);

      // Nettoyer l'URL pour éviter de re-déclencher au refresh
      const url = new URL(window.location.href);
      url.searchParams.delete("user");
      window.history.replaceState({}, "", url.toString());
    } catch (err) {
      console.error("Erreur ouverture conversation:", err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }
    fetchConversations();

    // Si on arrive depuis une carte mentor (?user=id), ouvrir la conversation
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const targetUserId = params.get("user");
      if (targetUserId) {
        openConversationWithUser(targetUserId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  // Rafraîchir les messages toutes les 5 s pour synchroniser les statuts
  // (envoyé / vu) et les réactions
  useEffect(() => {
    if (!selectedConversation) return;
    const interval = window.setInterval(() => {
      fetchMessages(selectedConversation._id);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/chat/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        router.push("/connexion");
        return;
      }

      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `http://localhost:5000/api/chat/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `http://localhost:5000/api/chat/conversations/${selectedConversation._id}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: newMessage }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        fetchConversations();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!selectedConversation) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `http://localhost:5000/api/chat/conversations/${selectedConversation._id}/messages/${messageId}/reactions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emoji }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur de réaction");
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? data.message : m))
      );
    } catch (err) {
      console.error("Error toggling reaction:", err);
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la réaction"
      );
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!selectedConversation) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `http://localhost:5000/api/chat/conversations/${selectedConversation._id}/messages/${messageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Suppression impossible");
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      fetchConversations();
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer ce message"
      );
    }
  };

  const getOtherParticipant = (
    conversation: Conversation
  ): Participant | null => {
    if (!currentUser) return null;
    return (
      conversation.participants.find(
        (p) => p._id !== currentUser.id && p._id !== currentUser._id
      ) || null
    );
  };

  const handleStartVideoCall = () => {
    if (!selectedConversation) return;
    const other = getOtherParticipant(selectedConversation);
    if (other) {
      setCallUserId(other._id);
      setCallUserName(other.name || other.username);
      setCallUserAvatar(other.avatar || "");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (diffDays === 1) return "Hier";
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(conv);
    if (!other) return false;
    return (
      other.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      other.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Chargement des messages...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex h-screen bg-gray-50 pt-16">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-80 border-r border-gray-200 bg-white flex flex-col flex-shrink-0"
        >
          <div className="p-4 border-b border-gray-100">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Messages
            </h1>
          </div>

          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Rechercher..." className="pl-10 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <AnimatePresence>
              {filteredConversations.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-gray-500">Aucune conversation</p>
                  <p className="text-xs text-gray-400 mt-1">Trouvez un mentor sur la page Apprendre</p>
                </motion.div>
              ) : (
                filteredConversations.map((conversation, idx) => {
                  const other = getOtherParticipant(conversation);
                  const isSelected = selectedConversation?._id === conversation._id;
                  return (
                    <motion.div
                      key={conversation._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`p-4 cursor-pointer flex items-center transition-all duration-200 border-l-2 ${
                        isSelected ? "bg-blue-50 border-l-blue-500" : "hover:bg-gray-50 border-l-transparent"
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="relative mr-3">
                        <Avatar className="h-11 w-11">
                          <AvatarImage src={other?.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {(other?.name || other?.username || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold truncate text-sm text-gray-900">
                            {other?.name || other?.username || "Utilisateur"}
                          </h3>
                          <span className="text-xs text-gray-400 ml-2">
                            {formatTime(conversation.lastMessageAt || conversation.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-0.5">
                          {conversation.lastMessage?.text || "Nouvelle conversation"}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </ScrollArea>
        </motion.div>

        {/* Chat area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 flex flex-col bg-white"
        >
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                    <AvatarImage src={getOtherParticipant(selectedConversation)?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {(getOtherParticipant(selectedConversation)?.name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {getOtherParticipant(selectedConversation)?.name || "Utilisateur"}
                    </h2>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      En ligne
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="ghost" size="icon" onClick={handleStartVideoCall} title="Appel vidéo" className="hover:bg-blue-50 hover:text-blue-600">
                      <Video className="h-5 w-5" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="ghost" size="icon" onClick={handleStartVideoCall} title="Appel audio" className="hover:bg-green-50 hover:text-green-600">
                      <Phone className="h-5 w-5" />
                    </Button>
                  </motion.div>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4 bg-gray-50/50">
                <div className="space-y-3 max-w-3xl mx-auto">
                  <AnimatePresence initial={false}>
                    {messages.map((message) => {
                      const isMe =
                        message.sender._id === currentUser?.id ||
                        message.sender._id === currentUser?._id;
                      const otherId = getOtherParticipant(
                        selectedConversation
                      )?._id;
                      const seen =
                        message.status === "seen" ||
                        (!!otherId &&
                          (message.readBy || []).some(
                            (r) => r.toString() === otherId.toString()
                          ));
                      const reactions = groupReactions(
                        message.reactions,
                        (currentUser?.id || currentUser?._id || "").toString()
                      );
                      return (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          {!isMe && (
                            <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                              <AvatarImage src={message.sender.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                                {(message.sender.name || "U").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="group relative max-w-[70%]">
                            <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                              isMe ? "bg-blue-500 text-white rounded-br-md" : "bg-white text-gray-900 rounded-bl-md border border-gray-100"
                            }`}>
                              <p className="text-sm leading-relaxed">{message.text}</p>
                              <div className={`flex items-center justify-end gap-1 text-xs mt-1 ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                                <span>{formatTime(message.createdAt)}</span>
                                {isMe &&
                                  (seen ? (
                                    <CheckCheck className="h-3.5 w-3.5" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  ))}
                              </div>
                              {reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {reactions.map((r) => (
                                    <button
                                      key={r.emoji}
                                      type="button"
                                      onClick={() =>
                                        toggleReaction(message._id, r.emoji)
                                      }
                                      className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                                        r.reactedByMe
                                          ? "bg-blue-600 text-white"
                                          : isMe
                                          ? "bg-white/20 text-white hover:bg-white/30"
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                      }`}
                                    >
                                      {r.emoji} {r.count}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Actions au survol : réagir / supprimer (avant lecture) */}
                            <div className="absolute -top-3 right-0 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() =>
                                  setEmojiPickerFor(
                                    emojiPickerFor === message._id
                                      ? null
                                      : message._id
                                  )
                                }
                                title="Réagir"
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:text-blue-600"
                              >
                                <Smile className="h-4 w-4" />
                              </button>
                              {isMe && !seen && (
                                <button
                                  type="button"
                                  onClick={() => deleteMessage(message._id)}
                                  title="Supprimer (avant lecture)"
                                  className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>

                            {emojiPickerFor === message._id && (
                              <EmojiPicker
                                onSelect={(emoji) => {
                                  toggleReaction(message._id, emoji);
                                  setEmojiPickerFor(null);
                                }}
                              />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-2 max-w-3xl mx-auto">
                  <Input placeholder="Écrivez un message..." className="flex-1 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all h-12"
                    value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
                    <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim() || sendingMessage}
                      className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      {sendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sélectionnez une conversation</h3>
                <p className="text-gray-500 max-w-sm">Choisissez une conversation à gauche pour commencer à discuter</p>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* WebRTC Video Call */}
        {callUserId && currentUser && selectedConversation && (
          <WebRTCCall
            userId={callUserId}
            currentUserId={currentUser.id || currentUser._id || ""}
            currentUserName={currentUser.name || currentUser.username || "Moi"}
            currentUserAvatar={currentUser.avatar}
            remoteUserName={callUserName}
            remoteUserAvatar={callUserAvatar}
            onEndCall={() => { setCallUserId(null); setCallUserName(""); setCallUserAvatar(""); }}
          />
        )}
      </div>
    </PageTransition>
  );
}
