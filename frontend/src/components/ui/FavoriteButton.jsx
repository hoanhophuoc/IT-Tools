"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FiHeart } from "react-icons/fi";

export default function FavoriteButton({ toolId, onToggle, size = 18 }) {
  const { isAuthenticated, addFavorite, removeFavorite, favoriteToolIds } =
    useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const isCurrentlyFavorite = favoriteToolIds.has(toolId);

  if (!isAuthenticated) {
    return null;
  }

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing) return;
    setIsProcessing(true);

    let success = false;
    if (isCurrentlyFavorite) {
      success = await removeFavorite(toolId);
    } else {
      success = await addFavorite(toolId);
    }

    if (success && onToggle) {
      onToggle(!isCurrentlyFavorite);
    }
    if (!success) {
      alert(`Failed to ${isCurrentlyFavorite ? "remove" : "add"} favorite.`);
    }

    setIsProcessing(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={`rounded-full p-1 transition-colors duration-150 ease-in-out focus:ring-1 focus:ring-pink-500 focus:ring-offset-1 focus:outline-none dark:focus:ring-offset-slate-800 ${isProcessing ? "animate-pulse text-gray-400" : ""} ${isCurrentlyFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"}`}
      title={isCurrentlyFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <span className="sr-only">
        {isCurrentlyFavorite ? "Remove from favorites" : "Add to favorites"}
      </span>
      <FiHeart
        fill={isCurrentlyFavorite ? "currentColor" : "none"}
        size={size}
      />
    </button>
  );
}
