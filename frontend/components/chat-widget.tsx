"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  // CreditCard, // ⚠️ Paiement commenté
  FileText,
  // Lock, // ⚠️ Paiement commenté
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Monitor,
  Paperclip,
  Phone,
  PhoneOff,
  Plus,
  Search,
  Send,
  Smile,
  Trash2,
  X,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

import { useAuth } from "@/contexts/AuthContext";
import { useCanContactMonitors } from "@/hooks/use-active-enrollment";
// import PaymentDialog from "@/components/payment-dialog"; // ⚠️ Paiement commenté
import {
  EmojiPicker,
  groupReactions,
  type MessageReaction,
} from "@/components/chat-emoji-picker";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type UserLite = {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
};

type AttachmentType = {
  url: string;
  name: string;
  type: string;
  size: number;
};

type MessageType = {
  _id: string;
  text: string;
  attachments?: AttachmentType[];
  sender: UserLite;
  createdAt: string;
  readBy?: string[];
  status?: "sent" | "seen";
  reactions?: MessageReaction[];
};

type ConversationType = {
  _id: string;
  participants: UserLite[];
  lastMessage?: MessageType;
  lastMessageAt?: string;
  updatedAt?: string;
};

import { API_BASE } from "@/lib/api-config";

function getUserDisplayName(u: UserLite) {
  return u.username || u.name || u.email || "Utilisateur";
}

function getUserInitial(u: UserLite) {
  return getUserDisplayName(u).charAt(0).toUpperCase();
}

async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string } = {}
): Promise<T> {
  const token = init.token || localStorage.getItem("authToken") || "";

  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : ({} as any);

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || "Request failed";
    throw new Error(msg);
  }

  return data as T;
}

export default function ChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const { canContactMonitors, loading: enrollmentLoading } =
    useCanContactMonitors();

  const currentUserId = useMemo(() => {
    const anyUser: any = user;
    return (anyUser?._id || anyUser?.id || "").toString();
  }, [user]);

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"list" | "chat">("list");
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<MessageType[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserLite[]>([]);

  const [messageText, setMessageText] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerUsers, setPickerUsers] = useState<UserLite[]>([]);
  const [pickerPage, setPickerPage] = useState(1);
  const [pickerHasMore, setPickerHasMore] = useState(false);
  const [isPickerLoading, setIsPickerLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  // const [paymentOpen, setPaymentOpen] = useState(false); // ⚠️ Paiement commenté
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // WebRTC & Socket.io States
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const callStatusRef = useRef<string>("idle");

  const [callStatus, setCallStatus] = useState<
    "idle" | "calling" | "incoming" | "active"
  >("idle");
  const [incomingCallData, setIncomingCallData] = useState<{
    fromId: string;
    fromName: string;
    fromAvatar: string;
    signal: any;
    isScreenShare: boolean;
  } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null;
    return conversations.find((c) => c._id === selectedConversationId) || null;
  }, [conversations, selectedConversationId]);

  const otherParticipant = useMemo(() => {
    if (!selectedConversation) return null;
    const other = selectedConversation.participants.find(
      (p) => p._id?.toString() !== currentUserId
    );
    return other || selectedConversation.participants[0] || null;
  }, [currentUserId, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
    } else if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  };

  const showNotification = (title: string, body: string) => {
    if (notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  };

  const calculateUnreadCount = useCallback(() => {
    let count = 0;
    conversations.forEach((conv) => {
      if (
        conv.lastMessage &&
        conv.lastMessage.sender._id !== currentUserId &&
        !conv.lastMessage.readBy?.includes(currentUserId)
      ) {
        count++;
      }
    });
    return count;
  }, [conversations, currentUserId]);

  const refreshConversations = async () => {
    const data = await apiFetch<{ conversations: ConversationType[] }>(
      "/api/chat/conversations"
    );
    const newConversations = data.conversations || [];

    // Check for new messages
    if (conversations.length > 0 && !isOpen) {
      newConversations.forEach((newConv) => {
        const oldConv = conversations.find((c) => c._id === newConv._id);
        if (
          newConv.lastMessage &&
          oldConv?.lastMessage?._id !== newConv.lastMessage._id &&
          newConv.lastMessage.sender._id !== currentUserId
        ) {
          const sender = newConv.lastMessage.sender;
          const senderName = getUserDisplayName(sender);
          showNotification(
            `Nouveau message de ${senderName}`,
            newConv.lastMessage.text
          );
        }
      });
    }

    setConversations(newConversations);
  };

  const refreshMessages = async (conversationId: string) => {
    const data = await apiFetch<{ messages: MessageType[] }>(
      `/api/chat/conversations/${conversationId}/messages?limit=50`
    );
    const newMessages = data.messages || [];

    // Check for new messages in current conversation
    if (messages.length > 0 && newMessages.length > messages.length) {
      const newMsg = newMessages[newMessages.length - 1];
      if (newMsg.sender._id !== currentUserId && !isOpen) {
        const senderName = getUserDisplayName(newMsg.sender);
        showNotification(`Nouveau message de ${senderName}`, newMsg.text);
      }
    }

    setMessages(newMessages);

    setConversations((prev) =>
      prev.map((c) => {
        if (c._id !== conversationId) return c;

        if (!c.lastMessage) return c;
        if (c.lastMessage.sender?._id?.toString() === currentUserId) return c;
        if (c.lastMessage.readBy?.includes(currentUserId)) return c;

        return {
          ...c,
          lastMessage: {
            ...c.lastMessage,
            readBy: [...(c.lastMessage.readBy || []), currentUserId],
          },
        };
      })
    );
  };

  const runUserSearch = async (q: string) => {
    const data = await apiFetch<{ users: UserLite[] }>(
      `/api/chat/users/search?q=${encodeURIComponent(q)}`
    );
    setSearchResults(data.users || []);
  };

  const fetchPickerUsers = useCallback(
    async (opts?: { reset?: boolean }) => {
      const reset = opts?.reset ?? false;

      const q = pickerQuery.trim();
      const nextPage = reset ? 1 : pickerPage;

      setIsPickerLoading(true);
      try {
        const data = await apiFetch<{
          users: UserLite[];
          pagination?: {
            page: number;
            limit: number;
            total: number;
            hasMore: boolean;
          };
        }>(
          `/api/chat/users?page=${nextPage}&limit=20&q=${encodeURIComponent(q)}`
        );

        const users = Array.isArray(data.users) ? data.users : [];
        const hasMore = !!data.pagination?.hasMore;

        setPickerUsers((prev) => (reset ? users : [...prev, ...users]));
        setPickerHasMore(hasMore);
        setPickerPage(nextPage + 1);
      } catch (error) {
        console.error('[ChatWidget] Error fetching picker users:', error);
      } finally {
        setIsPickerLoading(false);
      }
    },
    [pickerPage, pickerQuery]
  );

  const openConversationWith = async (userId: string) => {
    const data = await apiFetch<{ conversation: ConversationType }>(
      "/api/chat/conversations",
      {
        method: "POST",
        body: JSON.stringify({ userId }),
      }
    );

    const conv = data.conversation;
    await refreshConversations();
    setSelectedConversationId(conv._id);
    setView("chat");
    await refreshMessages(conv._id);
    setSearchQuery("");
    setSearchResults([]);
    setIsUserPickerOpen(false);
  };

  const openConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setView("chat");
    await refreshMessages(conversationId);
  };

  const sendMessage = async (attachment?: AttachmentType) => {
    if (!selectedConversationId) return;
    const text = messageText.trim();
    if (!text && !attachment) return;

    setMessageText("");

    const data = await apiFetch<{ message: MessageType }>(
      `/api/chat/conversations/${selectedConversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          text,
          attachments: attachment ? [attachment] : [],
        }),
      }
    );

    setMessages((prev) => [...prev, data.message]);
    await refreshConversations();
    scrollToBottom();
  };

  // Sélection d'un fichier : upload puis envoi immédiat avec le texte saisi (si présent)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Permet de re-sélectionner le même fichier ensuite
    e.target.value = "";
    if (!file || !selectedConversationId) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("authToken") || "";

      const res = await fetch(`${API_BASE}/api/chat/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Upload échoué");
      }

      await sendMessage(data.attachment as AttachmentType);
    } catch (e: any) {
      toast.error(e?.message || "Impossible d'envoyer le fichier");
    } finally {
      setUploadingFile(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!selectedConversationId) return;
    try {
      const data = await apiFetch<{ message: MessageType }>(
        `/api/chat/conversations/${selectedConversationId}/messages/${messageId}/reactions`,
        {
          method: "POST",
          body: JSON.stringify({ emoji }),
        }
      );
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? data.message : m))
      );
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de la réaction");
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!selectedConversationId) return;
    try {
      await apiFetch(
        `/api/chat/conversations/${selectedConversationId}/messages/${messageId}`,
        { method: "DELETE" }
      );
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      refreshConversations().catch(() => undefined);
    } catch (e: any) {
      toast.error(e?.message || "Impossible de supprimer ce message");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setIsOpen(false);
      return;
    }

    // Request notification permission on mount
    requestNotificationPermission();

    setError(null);
    refreshConversations().catch((e) => setError(e.message));

    const id = window.setInterval(() => {
      refreshConversations().catch(() => undefined);
    }, 10000);

    return () => {
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Socket initialization
  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;

    const socket = io(API_BASE);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", currentUserId);
    });
    socket.emit("join", currentUserId);

    socket.on("incoming-call", (data: any) => {
      // Déjà en appel ? Signaler "occupé" au lieu d'empiler un 2e appel
      if (callStatusRef.current !== "idle") {
        socket.emit("call-busy", { to: data.from, from: currentUserId });
        toast.error("Appel entrant ignoré (déjà en ligne)", { duration: 2500 });
        return;
      }
      setIncomingCallData({
        fromId: data.from,
        fromName: data.fromName,
        fromAvatar: data.fromAvatar,
        signal: data.signal,
        isScreenShare: data.isScreenShare,
      });
      setCallStatus("incoming");
    });

    socket.on("call-declined", () => {
      toast.info("Appel refusé par l'interlocuteur", { duration: 3000 });
      endCallInternally();
    });

    socket.on("call-busy", () => {
      toast.info("L'interlocuteur est déjà en ligne", { duration: 3000 });
      endCallInternally();
    });

    socket.on("disconnect", () => {
      if (callStatusRef.current !== "idle") {
        endCallInternally();
      }
    });

    socket.on("call-accepted", async (signal: any) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        setCallStatus("active");
      }
    });

    socket.on("call-ended", () => {
      endCallInternally();
    });

    socket.on("ice-candidate", async (candidate: any) => {
      if (pcRef.current) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ice candidate", e);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, currentUserId]);

  const endCallInternally = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setCallStatus("idle");
    setIncomingCallData(null);
    setRemoteStream(null);
    setIsScreenSharing(false);
  };

  const endCall = () => {
    const targetId = incomingCallData?.fromId || otherParticipant?._id;
    if (targetId && socketRef.current) {
      socketRef.current.emit("end-call", { to: targetId });
    }
    endCallInternally();
  };

  const startCall = async (isScreenShare = false) => {
    if (!otherParticipant || !socketRef.current) return;

    setCallStatus("calling");
    setIsScreenSharing(isScreenShare);

    try {
      const stream = isScreenShare
        ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        : await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      localStreamRef.current = stream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate && otherParticipant) {
          socketRef.current?.emit("ice-candidate", {
            to: otherParticipant._id,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current.emit("call-user", {
        to: otherParticipant._id,
        from: currentUserId,
        signalData: offer,
        fromName: getUserDisplayName(user as any),
        fromAvatar: (user as any)?.avatar,
        isScreenShare,
      });
    } catch (err) {
      console.error("Error starting call:", err);
      setCallStatus("idle");
      toast.error(
        "Micro ou partage d'écran indisponible. Vérifiez les permissions du navigateur.",
        { duration: 4000 }
      );
    }
  };

  const declineIncomingCall = () => {
    const targetId = incomingCallData?.fromId;
    if (targetId && socketRef.current) {
      socketRef.current.emit("call-declined", {
        to: targetId,
        from: currentUserId,
      });
    }
    endCallInternally();
  };

  const acceptCall = async () => {
    if (!incomingCallData || !socketRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate && incomingCallData) {
          socketRef.current?.emit("ice-candidate", {
            to: incomingCallData.fromId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.signal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit("accept-call", {
        to: incomingCallData.fromId,
        signalData: answer,
      });

      setCallStatus("active");
    } catch (err) {
      console.error("Error accepting call:", err);
      endCall();
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !isOpen || !selectedConversationId) return;

    refreshMessages(selectedConversationId).catch(() => undefined);

    const id = window.setInterval(() => {
      refreshMessages(selectedConversationId).catch(() => undefined);
    }, 5000);

    return () => {
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isOpen, selectedConversationId]);

  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;

    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      runUserSearch(q).catch(() => undefined);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [isAuthenticated, isOpen, searchQuery]);

  useEffect(() => {
    if (!isAuthenticated || !isOpen || !isUserPickerOpen) return;

    setPickerUsers([]);
    setPickerPage(1);
    setPickerHasMore(false);
    fetchPickerUsers({ reset: true }).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isOpen, isUserPickerOpen]);

  useEffect(() => {
    if (!isAuthenticated || !isOpen || !isUserPickerOpen) return;

    const timeout = window.setTimeout(() => {
      setPickerUsers([]);
      setPickerPage(1);
      setPickerHasMore(false);
      fetchPickerUsers({ reset: true }).catch(() => undefined);
    }, 300);

    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isOpen, isUserPickerOpen, pickerQuery]);

  useEffect(() => {
    if (!isOpen || view !== "chat") return;
    scrollToBottom();
  }, [isOpen, view, messages.length]);

  useEffect(() => {
    const count = calculateUnreadCount();
    setUnreadCount(count);
  }, [conversations, selectedConversationId, calculateUnreadCount]);

  if (!isAuthenticated) {
    return null;
  }

  // Hide the floating chat widget on /messages, which has its own chat UI
  if (pathname.startsWith("/messages")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
      <div className="relative">
        {!isOpen && (
          <Button
            type="button"
            className="pointer-events-auto h-14 w-14 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 relative"
            onClick={() => {
              setIsOpen(true);
              setView("list");
            }}
          >
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold shadow-lg animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        )}

        {isOpen && (
          <div className="pointer-events-auto absolute bottom-3 right-0 w-[360px] max-w-[calc(100vw-3rem)]">
            <Card className="shadow-2xl border-2">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {view === "chat" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setView("list");
                          setSelectedConversationId(null);
                          setMessages([]);
                        }}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="h-9 w-9" />
                    )}

                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {view === "chat" && otherParticipant
                          ? getUserDisplayName(otherParticipant)
                          : "Messages"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {view === "chat" ? "Discussion" : "Rechercher ou discuter"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {view === "chat" && otherParticipant && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => startCall(false)}
                          disabled={callStatus !== "idle"}
                        >
                          <Phone className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => startCall(true)}
                          disabled={callStatus !== "idle"}
                        >
                          <Monitor className="h-4 w-4 text-blue-600" />
                        </Button>
                      </>
                    )}
                    {view === "list" && canContactMonitors && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsUserPickerOpen(true);
                          setPickerQuery("");
                          setPickerUsers([]);
                          setPickerPage(1);
                          setPickerHasMore(false);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setIsOpen(false);
                        setView("list");
                        setSelectedConversationId(null);
                        setMessages([]);
                        setSearchQuery("");
                        setSearchResults([]);
                        setError(null);
                        setIsUserPickerOpen(false);
                        setPickerQuery("");
                        setPickerUsers([]);
                        setPickerPage(1);
                        setPickerHasMore(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-3 pt-0">
                {error && (
                  <div className="mb-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {view === "list" && (
                  <div className="space-y-3">
                    {/* ⚠️ Paiement commenté : la restriction a été supprimée
                    {!canContactMonitors && !enrollmentLoading && (
                      <div className="mb-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                        <div className="flex items-start gap-2">
                          <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>
                            Vous devez avoir payé pour un cours pour contacter
                            les moniteurs.
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setPaymentOpen(true)}
                          className="mt-2 w-full h-8 gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Payer pour débloquer
                        </Button>
                      </div>
                    )}
                    */}
                    {canContactMonitors && (
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Rechercher un utilisateur..."
                          className="pl-8"
                        />
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <div className="rounded-md border">
                        <ScrollArea className="h-40">
                          <div className="p-1">
                            {searchResults.map((u) => (
                              <button
                                key={u._id}
                                type="button"
                                onClick={() => openConversationWith(u._id)}
                                className="w-full rounded-md px-2 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2"
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={u.avatar} />
                                  <AvatarFallback>{getUserInitial(u)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-medium">
                                    {getUserDisplayName(u)}
                                  </div>
                                  <div className="truncate text-xs text-muted-foreground">
                                    {u.email || ""}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Conversations
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => refreshConversations().catch(() => undefined)}
                      >
                        Actualiser
                      </Button>
                    </div>

                    <div className="rounded-md border">
                      <ScrollArea className="h-72">
                        <div className="p-1">
                          {conversations.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                              Aucune conversation
                            </div>
                          ) : (
                            conversations.map((c) => {
                              const other =
                                c.participants.find(
                                  (p) => p._id?.toString() !== currentUserId
                                ) || c.participants[0];

                              const title = other ? getUserDisplayName(other) : "Conversation";
                              const subtitle =
                                c.lastMessage?.text ||
                                (c.lastMessage?.attachments?.length
                                  ? "📎 Pièce jointe"
                                  : "");
                              const isUnread =
                                !!c.lastMessage &&
                                c.lastMessage.sender._id !== currentUserId &&
                                !c.lastMessage.readBy?.includes(currentUserId) &&
                                c._id !== selectedConversationId;

                              return (
                                <button
                                  key={c._id}
                                  type="button"
                                  onClick={() => openConversation(c._id)}
                                  className={cn(
                                    "w-full rounded-md px-2 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2",
                                    isUnread && "bg-blue-50 hover:bg-blue-100"
                                  )}
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={other?.avatar} />
                                    <AvatarFallback>
                                      {other ? getUserInitial(other) : "C"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0 flex-1">
                                    <div className={cn(
                                      "truncate text-sm",
                                      isUnread ? "font-bold" : "font-medium"
                                    )}>
                                      {title}
                                    </div>
                                    <div className={cn(
                                      "truncate text-xs",
                                      isUnread ? "text-blue-600 font-medium" : "text-muted-foreground"
                                    )}>
                                      {subtitle}
                                    </div>
                                  </div>
                                  {isUnread && (
                                    <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                )}

                {view === "chat" && selectedConversationId && (
                  <div className="flex h-[440px] flex-col">
                    <div className="flex-1 overflow-hidden rounded-md border">
                      <ScrollArea className="h-full">
                        <div className="p-3 space-y-2">
                          {messages.map((m) => {
                            const isMine =
                              m.sender?._id?.toString() === currentUserId;
                            const otherId = otherParticipant?._id?.toString();
                            const seen =
                              m.status === "seen" ||
                              (!!otherId &&
                                (m.readBy || []).some(
                                  (r) => r.toString() === otherId
                                ));
                            const reactions = groupReactions(
                              m.reactions,
                              currentUserId
                            );

                            return (
                              <div
                                key={m._id}
                                className={cn(
                                  "flex",
                                  isMine ? "justify-end" : "justify-start"
                                )}
                              >
                                <div
                                  className={cn(
                                    "group relative max-w-[80%]",
                                    isMine ? "items-end" : "items-start"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "rounded-lg px-3 py-2 text-sm",
                                      isMine
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    )}
                                  >
                                    {m.text && <p>{m.text}</p>}
                                    {m.attachments && m.attachments.length > 0 && (
                                      <div className={m.text ? "mt-1.5 space-y-1.5" : "space-y-1.5"}>
                                        {m.attachments.map((att, idx) => {
                                          const fullUrl = att.url.startsWith("http")
                                            ? att.url
                                            : `${API_BASE}${att.url}`;
                                          const isImage = att.type.startsWith("image/");
                                          return isImage ? (
                                            <a
                                              key={idx}
                                              href={fullUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="block"
                                            >
                                              <Image
                                                src={fullUrl}
                                                alt={att.name}
                                                width={400}
                                                height={300}
                                                unoptimized
                                                className="max-h-44 w-auto rounded-md object-cover border border-black/10"
                                              />
                                            </a>
                                          ) : (
                                            <a
                                              key={idx}
                                              href={fullUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              download
                                              className={cn(
                                                "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
                                                isMine
                                                  ? "bg-white/15 text-primary-foreground hover:bg-white/25"
                                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                              )}
                                            >
                                              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                                              <span className="max-w-[160px] truncate">
                                                {att.name}
                                              </span>
                                            </a>
                                          );
                                        })}
                                      </div>
                                    )}
                                    <div
                                      className={cn(
                                        "mt-0.5 flex items-center justify-end gap-1 text-[10px]",
                                        isMine
                                          ? "text-primary-foreground/70"
                                          : "text-muted-foreground"
                                      )}
                                    >
                                      <span>{formatTime(m.createdAt)}</span>
                                      {isMine &&
                                        (seen ? (
                                          <CheckCheck className="h-3 w-3" />
                                        ) : (
                                          <Check className="h-3 w-3" />
                                        ))}
                                    </div>
                                    {reactions.length > 0 && (
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {reactions.map((r) => (
                                          <button
                                            key={r.emoji}
                                            type="button"
                                            onClick={() =>
                                              toggleReaction(m._id, r.emoji)
                                            }
                                            className={cn(
                                              "rounded-full px-1.5 py-0.5 text-xs font-medium transition-colors",
                                              r.reactedByMe
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-200/70 text-gray-700 hover:bg-gray-300/80"
                                            )}
                                          >
                                            {r.emoji} {r.count}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Actions au survol : réagir / supprimer */}
                                  <div className="absolute -top-2.5 right-0 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEmojiPickerFor(
                                          emojiPickerFor === m._id
                                            ? null
                                            : m._id
                                        )
                                      }
                                      title="Réagir"
                                      className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:text-blue-600"
                                    >
                                      <Smile className="h-3.5 w-3.5" />
                                    </button>
                                    {isMine && !seen && (
                                      <button
                                        type="button"
                                        onClick={() => deleteMessage(m._id)}
                                        title="Supprimer (avant lecture)"
                                        className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:text-red-600"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  {emojiPickerFor === m._id && (
                                    <EmojiPicker
                                      onSelect={(emoji) => {
                                        toggleReaction(m._id, emoji);
                                        setEmojiPickerFor(null);
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                    </div>

                    {callStatus !== "idle" && (
                      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-6 text-center animate-in fade-in zoom-in duration-300">
                        <Avatar className="h-20 w-20 mb-4 ring-4 ring-primary/10">
                          <AvatarImage src={incomingCallData?.fromAvatar || otherParticipant?.avatar} />
                          <AvatarFallback className="text-xl">
                            {getUserInitial((incomingCallData as any) || (otherParticipant as any))}
                          </AvatarFallback>
                        </Avatar>

                        <h3 className="text-lg font-bold mb-1">
                          {incomingCallData?.fromName || getUserDisplayName(otherParticipant as any)}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-8">
                          {callStatus === "incoming" && "Appel entrant..."}
                          {callStatus === "calling" && "Appel en cours..."}
                          {callStatus === "active" && (isScreenSharing ? "Partage d'écran actif" : "Appel audio actif")}
                        </p>

                        <div className="flex items-center gap-4">
                          {callStatus === "incoming" ? (
                            <>
                              <Button
                                size="lg"
                                variant="destructive"
                                className="rounded-full h-14 w-14 p-0"
                                onClick={declineIncomingCall}
                              >
                                <PhoneOff className="h-6 w-6" />
                              </Button>
                              <Button
                                size="lg"
                                className="rounded-full h-14 w-14 p-0 bg-green-600 hover:bg-green-700"
                                onClick={acceptCall}
                              >
                                <Phone className="h-6 w-6" />
                              </Button>
                            </>
                          ) : (
                            <>
                              {callStatus === "active" && (
                                <Button
                                  variant="outline"
                                  className="rounded-full h-12 w-12 p-0"
                                  onClick={toggleMute}
                                >
                                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                </Button>
                              )}
                              <Button
                                size="lg"
                                variant="destructive"
                                className="rounded-full h-14 w-14 p-0"
                                onClick={endCall}
                              >
                                <PhoneOff className="h-6 w-6" />
                              </Button>
                            </>
                          )}
                        </div>

                        {callStatus === "active" && remoteStream && (
                          <div className="mt-8 w-full">
                            {isScreenSharing ? (
                              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border shadow-lg">
                                <video
                                  autoPlay
                                  playsInline
                                  ref={(v: HTMLVideoElement | null) => {
                                    if (v && remoteStream) v.srcObject = remoteStream;
                                  }}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <div className="animate-pulse flex space-x-2">
                                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <Separator className="my-3" />

                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                        title="Joindre un fichier"
                      >
                        {uploadingFile ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Paperclip className="h-4 w-4" />
                        )}
                      </Button>
                      <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Écrire un message..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            sendMessage().catch(() => undefined);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => sendMessage().catch(() => undefined)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

      </div>

      {/* <PaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} /> */}

      <Dialog open={isUserPickerOpen} onOpenChange={setIsUserPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Démarrer une discussion</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder="Rechercher un utilisateur..."
                className="pl-8"
              />
            </div>

            <div className="rounded-md border">
              <ScrollArea className="h-72">
                <div className="p-1">
                  {pickerUsers.length === 0 && !isPickerLoading ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      Aucun utilisateur
                    </div>
                  ) : (
                    pickerUsers.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => openConversationWith(u._id)}
                        className="w-full rounded-md px-2 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar} />
                          <AvatarFallback>{getUserInitial(u)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {getUserDisplayName(u)}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {u.email || ""}
                          </div>
                        </div>
                      </button>
                    ))
                  )}

                  {isPickerLoading && (
                    <div className="px-3 py-3 text-center text-sm text-muted-foreground">
                      Chargement...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {pickerHasMore && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isPickerLoading}
                onClick={() => fetchPickerUsers({ reset: false }).catch(() => undefined)}
              >
                Charger plus
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
