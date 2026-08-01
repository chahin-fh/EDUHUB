"use client"

import { useState } from "react"
import { Star, Github, Linkedin, Twitter, MessageCircle } from "lucide-react"
import { getExpertiseLabel, type ExpertiseItem } from "@/lib/utils"

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  bio: string;
  isActive: boolean;
  createdAt: string;
  avatar?: string;
  monitorProfile?: {
    expertise: ExpertiseItem[];
    rating: number;
    verified: boolean;
  };
}

interface MentorCardProps {
  user: User
}

export default function MentorCard({ user }: MentorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const profession = user.monitorProfile?.expertise?.[0]
    ? getExpertiseLabel(user.monitorProfile.expertise[0])
    : "Mentor";
  const rating = user.monitorProfile?.rating || 0;
  const description = user.bio || "No description provided.";
  const avatar = user.avatar || "👤"; // Default avatar if none provided

  return (
    <div
      className="bg-background border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 transform hover:-translate-y-1"
      onClick={() => setIsExpanded(!isExpanded)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-6xl cursor-pointer relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        />
        <span
          className="relative z-10 transition-transform duration-300"
          style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
        >
          {avatar}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Social Icons */}
        <div className="flex gap-3 mb-4">
          <button className="p-2 hover:bg-muted rounded-lg transition hover:text-primary">
            <Github size={18} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition hover:text-primary">
            <Linkedin size={18} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition hover:text-primary">
            <Twitter size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Name & Title */}
        <h3 className="text-lg font-bold mb-1">{user.name}</h3>
        <p className="text-sm text-primary font-medium mb-4">{profession}</p>

        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} className={`${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
          ))}
        </div>

        {/* Description - Expandable */}
        <div
          className={`transition-all duration-300 overflow-hidden ${isExpanded ? "max-h-40 opacity-100 mb-4" : "max-h-0 opacity-0"}`}
        >
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition text-sm font-medium">
            Profile
          </button>
          <button className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg transition text-sm font-medium flex items-center justify-center gap-1">
            <MessageCircle size={16} />
            <span>Message</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
