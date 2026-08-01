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
