"use client";

// =====================================================================
// Sélecteur d'emoji + helpers pour les réactions sur les messages.
// Utilisé par le chat-widget et la page /messages.
// =====================================================================

// Liste d'emojis rapides pour réagir aux messages
export const CHAT_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉"];

export interface MessageReaction {
  emoji: string;
  user: string; // id de l'utilisateur qui a réagi
  createdAt?: string;
}

export interface GroupedReaction {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

// Regroupe les réactions par emoji et indique si l'utilisateur courant a réagi
export function groupReactions(
  reactions: MessageReaction[] | undefined,
  currentUserId: string
): GroupedReaction[] {
  const map = new Map<string, GroupedReaction>();
  (reactions || []).forEach((r) => {
    const current = map.get(r.emoji) || {
      emoji: r.emoji,
      count: 0,
      reactedByMe: false,
    };
    current.count += 1;
    if (r.user?.toString() === currentUserId) current.reactedByMe = true;
    map.set(r.emoji, current);
  });
  return Array.from(map.values());
}

// Petit panneau d'emojis affiché au survol d'un message
export function EmojiPicker({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
  return (
    <div className="absolute bottom-full left-0 z-50 mb-1 flex gap-0.5 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
      {CHAT_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-base transition-transform hover:scale-125 hover:bg-gray-100"
          title={`Réagir avec ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
