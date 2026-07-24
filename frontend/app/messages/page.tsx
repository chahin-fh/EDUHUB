"use client";

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { WebRTCCall } from "@/components/webrtc-call";

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }
    fetchConversations();
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
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
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 pt-16">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>

        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher une conversation..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucune conversation</p>
              <p className="text-xs mt-1">
                Commencez par trouver un mentor sur la page Apprendre
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conversation) => {
                const other = getOtherParticipant(conversation);
                return (
                  <div
                    key={conversation._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer flex items-center transition-colors ${
                      selectedConversation?._id === conversation._id
                        ? "bg-blue-50"
                        : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="relative mr-3">
                      <Avatar>
                        <AvatarImage src={other?.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {(other?.name || other?.username || "U").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate text-sm">
                          {other?.name || other?.username || "Utilisateur"}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(
                            conversation.lastMessageAt || conversation.createdAt
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage?.text || "Nouvelle conversation"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage
                    src={getOtherParticipant(selectedConversation)?.avatar}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {(
                      getOtherParticipant(selectedConversation)?.name ||
                      getOtherParticipant(selectedConversation)?.username ||
                      "U"
                    ).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {getOtherParticipant(selectedConversation)?.name ||
                      getOtherParticipant(selectedConversation)?.username ||
                      "Utilisateur"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Conversation active
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStartVideoCall}
                  title="Appel vidéo"
                >
                  <Video className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStartVideoCall}
                  title="Appel audio"
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isMe =
                    message.sender._id === currentUser?.id ||
                    message.sender._id === currentUser?._id;
                  return (
                    <div
                      key={message._id}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isMe && (
                        <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                          <AvatarImage src={message.sender.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                            {(
                              message.sender.name ||
                              message.sender.username ||
                              "U"
                            ).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isMe
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 text-right ${
                            isMe ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Écrivez un message..."
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                >
                  {sendingMessage ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-500">
                Choisissez une conversation à gauche pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>

      {/* WebRTC Video Call */}
      {callUserId && currentUser && selectedConversation && (
        <WebRTCCall
          userId={callUserId}
          currentUserId={currentUser.id || currentUser._id || ""}
          currentUserName={currentUser.name || currentUser.username || "Moi"}
          currentUserAvatar={currentUser.avatar}
          remoteUserName={callUserName}
          remoteUserAvatar={callUserAvatar}
          onEndCall={() => {
            setCallUserId(null);
            setCallUserName("");
            setCallUserAvatar("");
          }}
        />
      )}
    </div>
  );
}
