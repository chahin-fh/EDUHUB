"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
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

type UserLite = {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
};

type MessageType = {
  _id: string;
  text: string;
  sender: UserLite;
  createdAt: string;
};

type ConversationType = {
  _id: string;
  participants: UserLite[];
  lastMessage?: MessageType;
  lastMessageAt?: string;
  updatedAt?: string;
};

const API_BASE = "http://localhost:5000";

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
  const [error, setError] = useState<string | null>(null);

  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerUsers, setPickerUsers] = useState<UserLite[]>([]);
  const [pickerPage, setPickerPage] = useState(1);
  const [pickerHasMore, setPickerHasMore] = useState(false);
  const [isPickerLoading, setIsPickerLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

  const calculateUnreadCount = () => {
    let count = 0;
    conversations.forEach((conv) => {
      if (
        conv.lastMessage &&
        conv.lastMessage.sender._id !== currentUserId &&
        conv._id !== selectedConversationId
      ) {
        count++;
      }
    });
    return count;
  };

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

  const sendMessage = async () => {
    if (!selectedConversationId) return;
    const text = messageText.trim();
    if (!text) return;

    setMessageText("");

    const data = await apiFetch<{ message: MessageType }>(
      `/api/chat/conversations/${selectedConversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ text }),
      }
    );

    setMessages((prev) => [...prev, data.message]);
    await refreshConversations();
    scrollToBottom();
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
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !isOpen || !selectedConversationId) return;

    refreshMessages(selectedConversationId).catch(() => undefined);

    const id = window.setInterval(() => {
      refreshMessages(selectedConversationId).catch(() => undefined);
    }, 5000);

    return () => {
      window.clearInterval(id);
    };
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
  }, [conversations, selectedConversationId]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      <div className="pointer-events-auto">
        {!isOpen && (
          <Button
            type="button"
            className="fixed left-6 top-1/2 -translate-y-1/2 z-[9999] h-14 w-14 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 relative"
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
          <div className="fixed left-20 top-1/2 -translate-y-1/2 z-[9999] w-[360px] max-w-[calc(100vw-3rem)]">
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
                    {view === "list" && (
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
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un utilisateur..."
                      className="pl-8"
                    />
                  </div>

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
                            const subtitle = c.lastMessage?.text || "";
                            const isUnread = c.lastMessage?.sender._id !== currentUserId && c._id !== selectedConversationId;

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
                                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                                  isMine
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                )}
                              >
                                {m.text}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center gap-2">
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
    </div>
  );
}
