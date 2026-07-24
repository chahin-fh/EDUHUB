"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  initialRating?: number;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  onChange?: (rating: number) => void;
  showValue?: boolean;
  count?: number;
}

export function RatingStars({
  initialRating = 0,
  readonly = false,
  size = "md",
  onChange,
  showValue = false,
  count,
}: RatingStarsProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(initialRating);

  const sizeMap = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  const handleClick = (rating: number) => {
    if (readonly) return;
    setCurrentRating(rating);
    onChange?.(rating);
  };

  const displayRating = readonly ? initialRating : currentRating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoveredRating(star)}
          onMouseLeave={() => !readonly && setHoveredRating(0)}
          className={cn(
            "transition-all duration-150",
            !readonly && "cursor-pointer hover:scale-110",
            readonly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeMap[size],
              "transition-colors",
              star <= (hoveredRating || displayRating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 fill-gray-100",
              hoveredRating >= star && !readonly && "drop-shadow-md"
            )}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {displayRating > 0 ? displayRating.toFixed(1) : "—"}
        </span>
      )}
      {count !== undefined && (
        <span className="ml-1 text-xs text-gray-400">({count})</span>
      )}
    </div>
  );
}

export function ReviewForm({
  onSubmit,
  loading = false,
}: {
  onSubmit: (data: { rating: number; comment: string }) => void;
  loading?: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit({ rating, comment });
    setRating(0);
    setComment("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Votre note
        </label>
        <RatingStars
          initialRating={rating}
          onChange={setRating}
          size="lg"
          showValue
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Commentaire (optionnel)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience..."
          rows={3}
          maxLength={1000}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={rating === 0 || loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? "Envoi..." : "Envoyer l'avis"}
      </button>
    </form>
  );
}
