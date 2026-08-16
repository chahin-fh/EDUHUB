"use client";

import { Github, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  github?: string;
  linkedin?: string;
  className?: string;
  iconSize?: number;
  light?: boolean;
}

// Ajoute https:// si l'utilisateur n'a saisi qu'un pseudo ou un ID
function normalizeUrl(url?: string) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function SocialLinks({
  github,
  linkedin,
  className,
  iconSize = 18,
  light = false,
}: SocialLinksProps) {
  const links = [
    { href: normalizeUrl(github), icon: Github, label: "GitHub" },
    { href: normalizeUrl(linkedin), icon: Linkedin, label: "LinkedIn" },
  ];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {links.map(({ href, icon: Icon, label }) =>
        href ? (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            className={cn(
              "p-2 rounded-lg transition-colors",
              light
                ? "text-blue-100 hover:text-white hover:bg-white/20"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            <Icon size={iconSize} />
          </a>
        ) : (
          <span
            key={label}
            title={`${label} non renseigné`}
            aria-disabled="true"
            className={cn(
              "p-2 rounded-lg cursor-not-allowed",
              light ? "text-blue-100/40" : "text-gray-300"
            )}
          >
            <Icon size={iconSize} />
          </span>
        )
      )}
    </div>
  );
}
