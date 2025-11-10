import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Send, MoreVertical, Search } from "lucide-react"

type Message = {
  id: string
  sender: string
  avatar: string
  content: string
  time: string
  unread: boolean
}

type Conversation = {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
  online: boolean
}

export default function MessagesPage() {
  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'Marie Martin',
      avatar: '/placeholder-avatar-1.jpg',
      lastMessage: 'Bonjour, comment puis-je vous aider avec votre cours de mathématiques ?',
      time: '10:30',
      unread: 2,
      online: true
    },
    {
      id: '2',
      name: 'Pierre Dubois',
      avatar: '/placeholder-avatar-2.jpg',
      lastMessage: 'Voici les exercices pour la semaine prochaine',
      time: 'Hier',
      unread: 0,
      online: false
    },
    {
      id: '3',
      name: 'Sophie Bernard',
      avatar: '/placeholder-avatar-3.jpg',
      lastMessage: 'Merci pour votre aide !',
      time: 'Lun',
      unread: 0,
      online: true
    },
  ]

  const messages: Message[] = [
    {
      id: '1',
      sender: 'them',
      avatar: '/placeholder-avatar-1.jpg',
      content: 'Bonjour, comment puis-je vous aider avec votre cours de mathématiques ?',
      time: '10:30',
      unread: false
    },
    {
      id: '2',
      sender: 'me',
      avatar: '/placeholder-avatar-2.jpg',
      content: 'Bonjour, je bloque sur les équations différentielles.',
      time: '10:32',
      unread: false
    },
    {
      id: '3',
      sender: 'them',
      avatar: '/placeholder-avatar-1.jpg',
      content: 'Je peux vous aider avec ça. Avez-vous des exercices spécifiques ?',
      time: '10:33',
      unread: true
    },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher une conversation..."
              className="pl-8"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y">
            {conversations.map((conversation) => (
              <div 
                key={conversation.id}
                className="p-4 hover:bg-gray-50 cursor-pointer flex items-center"
              >
                <div className="relative mr-3">
                  <Avatar>
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{conversation.name}</h3>
                    <span className="text-xs text-gray-500">{conversation.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                </div>
                {conversation.unread > 0 && (
                  <div className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {conversation.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="/placeholder-avatar-1.jpg" />
              <AvatarFallback>MM</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">Marie Martin</h2>
              <p className="text-xs text-green-500">En ligne</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'them' && (
                <Avatar className="h-8 w-8 mr-2 mt-1">
                  <AvatarImage src={message.avatar} />
                  <AvatarFallback>MM</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'me'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p>{message.content}</p>
                <p className={`text-xs mt-1 text-right ${
                  message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Message input */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Écrivez un message..."
              className="flex-1"
            />
            <Button size="icon">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
