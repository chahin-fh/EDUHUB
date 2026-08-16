"use client"

import { useState, type MouseEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Star, Github, Linkedin, MessageCircle } from "lucide-react"
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
  github?: string;
  linkedin?: string;
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
  const router = useRouter()

  const goToProfile = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    router.push(`/users/${user._id}`)
  }

  const goToMessage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    router.push(`/messages?user=${user._id}`)
  }

  const profession = user.monitorProfile?.expertise?.[0]
    ? getExpertiseLabel(user.monitorProfile.expertise[0])
    : "Mentor";
  const rating = user.monitorProfile?.rating || 0;
  const description = user.bio || "No description provided.";

  const normalizeUrl = (url?: string) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  return (
    <div
      className="bg-background border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 transform hover:-translate-y-1"
      onClick={() => setIsExpanded(!isExpanded)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-6xl cursor-pointer relative overflow-hidden">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name || user.username}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300"
            style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
          />
        ) : (
          <span
            className="relative z-10 transition-transform duration-300"
            style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
          >
            👤
          </span>
        )}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 transition-opacity duration-300 pointer-events-none ${isHovered ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Social Icons : cliquables si lien renseigné, inactifs sinon */}
        <div className="flex gap-1 mb-4">
          {[
            { href: normalizeUrl(user.github), icon: Github, label: "GitHub" },
            { href: normalizeUrl(user.linkedin), icon: Linkedin, label: "LinkedIn" },
          ].map(({ href, icon: Icon, label }) =>
            href ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                onClick={(e) => e.stopPropagation()}
                className="p-2 hover:bg-muted rounded-lg transition hover:text-primary"
              >
                <Icon size={18} className="text-muted-foreground" />
              </a>
            ) : (
              <span
                key={label}
                title={`${label} non renseigné`}
                aria-disabled="true"
                className="p-2 rounded-lg cursor-not-allowed opacity-50"
              >
                <Icon size={18} className="text-muted-foreground" />
              </span>
            )
          )}
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
          <button
            onClick={goToProfile}
            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition text-sm font-medium hover:scale-[1.03]"
          >
            Profil
          </button>
          <button
            onClick={goToMessage}
            className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg transition text-sm font-medium flex items-center justify-center gap-1 hover:scale-[1.03]"
          >
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
