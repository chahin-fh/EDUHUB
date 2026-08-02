import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Un item d'expertise peut être soit une simple chaîne ("Maths"),
// soit un objet { subject, level, verified } où subject est lui-même
// une chaîne ou un objet { _id, name, slug } (selon le peuplement côté API).
export type ExpertiseItem =
  | string
  | {
      subject: string | { _id: string; name: string; slug?: string };
      level?: string;
      verified?: boolean;
    };

// Retourne le libellé affichable d'un item d'expertise (toujours une chaîne).
export function getExpertiseLabel(exp: ExpertiseItem | undefined | null): string {
  if (!exp) return "";
  if (typeof exp === "string") return exp;
  if (typeof exp.subject === "string") return exp.subject;
  return exp.subject?.name || exp.subject?._id || "";
}

// Formate une date en "Il y a X min/h/j" (temps relatif en français).
export function timeAgo(dateStr?: string | Date): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} j`;
}
