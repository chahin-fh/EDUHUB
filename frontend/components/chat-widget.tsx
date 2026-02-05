"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Search,
  Send,
  X,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

  const refreshConversations = async () => {
    const data = await apiFetch<{ conversations: ConversationType[] }>(
      "/api/chat/conversations"
    );
    setConversations(data.conversations || []);
  };

  const refreshMessages = async (conversationId: string) => {
    const data = await apiFetch<{ messages: MessageType[] }>(
      `/api/chat/conversations/${conversationId}/messages?limit=50`
    );
    setMessages(data.messages || []);
  };

  const runUserSearch = async (q: string) => {
    const data = await apiFetch<{ users: UserLite[] }>(
      `/api/chat/users/search?q=${encodeURIComponent(q)}`
    );
    setSearchResults(data.users || []);
  };

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

    if (!isOpen) return;

    setError(null);
    refreshConversations().catch((e) => setError(e.message));

    const id = window.setInterval(() => {
      refreshConversations().catch(() => undefined);
    }, 10000);

    return () => {
      window.clearInterval(id);
    };
  }, [isAuthenticated, isOpen]);

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
    if (!isOpen || view !== "chat") return;
    scrollToBottom();
  }, [isOpen, view, messages.length]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {!isOpen && (
        <Button
          type="button"
          className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full shadow-lg"
          onClick={() => {
            setIsOpen(true);
            setView("list");
          }}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-[360px] max-w-[calc(100vw-3rem)]">
          <Card className="shadow-2xl">
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
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
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

                            return (
                              <button
                                key={c._id}
                                type="button"
                                onClick={() => openConversation(c._id)}
                                className="w-full rounded-md px-2 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2"
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={other?.avatar} />
                                  <AvatarFallback>
                                    {other ? getUserInitial(other) : "C"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-medium">
                                    {title}
                                  </div>
                                  <div className="truncate text-xs text-muted-foreground">
                                    {subtitle}
                                  </div>
                                </div>
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

              <div className="mt-2 text-[11px] text-muted-foreground">
                {isAuthenticated && user ? "" : ""}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
