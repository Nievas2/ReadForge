"use client"
import { useState, useCallback } from 'react';
import { saveToStorage, loadFromStorage } from '@/lib/storage';
import type { Sticker, UserStickers } from '@/types';

const STICKERS_KEY = 'user_stickers';

// All available stickers in the shop
export const ALL_STICKERS: Sticker[] = [
  // Book-themed (Common)
  { id: 'book_open', name: 'Open Book', emoji: '📖', category: 'book', price: 50, rarity: 'common', description: 'A classic open book' },
  { id: 'book_closed', name: 'Closed Book', emoji: '📕', category: 'book', price: 50, rarity: 'common', description: 'A beautiful red book' },
  { id: 'bookmark', name: 'Bookmark', emoji: '🔖', category: 'book', price: 75, rarity: 'common', description: 'Never lose your page' },
  { id: 'glasses', name: 'Reading Glasses', emoji: '👓', category: 'book', price: 100, rarity: 'common', description: 'For the studious reader' },
  
  // Book-themed (Rare)
  { id: 'book_stack', name: 'Book Stack', emoji: '📚', category: 'book', price: 200, rarity: 'rare', description: 'A stack of knowledge' },
  { id: 'quill', name: 'Quill Pen', emoji: '🪶', category: 'book', price: 250, rarity: 'rare', description: 'Write your own story' },
  { id: 'scroll', name: 'Ancient Scroll', emoji: '📜', category: 'book', price: 300, rarity: 'rare', description: 'Wisdom of the ages' },
  
  // Cute Characters (Common)
  { id: 'owl', name: 'Wise Owl', emoji: '🦉', category: 'character', price: 100, rarity: 'common', description: 'A wise reading companion' },
  { id: 'cat', name: 'Reading Cat', emoji: '🐱', category: 'character', price: 100, rarity: 'common', description: 'Cozy reading buddy' },
  { id: 'bunny', name: 'Bookworm Bunny', emoji: '🐰', category: 'character', price: 100, rarity: 'common', description: 'Hops through pages' },
  
  // Cute Characters (Rare)
  { id: 'fox', name: 'Clever Fox', emoji: '🦊', category: 'character', price: 250, rarity: 'rare', description: 'Smart and swift' },
  { id: 'dragon', name: 'Book Dragon', emoji: '🐉', category: 'character', price: 400, rarity: 'rare', description: 'Guards your library' },
  
  // Cute Characters (Epic)
  { id: 'unicorn', name: 'Magic Unicorn', emoji: '🦄', category: 'character', price: 600, rarity: 'epic', description: 'Brings magic to reading' },
  { id: 'phoenix', name: 'Phoenix Reader', emoji: '🔥', category: 'character', price: 750, rarity: 'epic', description: 'Rises through stories' },
  
  // Achievement Badges (Common)
  { id: 'star', name: 'Gold Star', emoji: '⭐', category: 'achievement', price: 75, rarity: 'common', description: 'You did great!' },
  { id: 'medal', name: 'Reader Medal', emoji: '🏅', category: 'achievement', price: 100, rarity: 'common', description: 'First place reader' },
  
  // Achievement Badges (Rare)
  { id: 'trophy', name: 'Champion Trophy', emoji: '🏆', category: 'achievement', price: 300, rarity: 'rare', description: 'Reading champion' },
  { id: 'crown', name: 'Royal Crown', emoji: '👑', category: 'achievement', price: 350, rarity: 'rare', description: 'Royalty of readers' },
  
  // Achievement Badges (Epic)
  { id: 'diamond', name: 'Diamond Reader', emoji: '💎', category: 'achievement', price: 500, rarity: 'epic', description: 'Precious achievement' },
  { id: 'rocket', name: 'Rocket Reader', emoji: '🚀', category: 'achievement', price: 600, rarity: 'epic', description: 'Sky-high reading' },
  
  // Achievement Badges (Legendary)
  { id: 'infinity', name: 'Infinite Reader', emoji: '♾️', category: 'achievement', price: 1000, rarity: 'legendary', description: 'Endless dedication' },
  { id: 'sparkles', name: 'Legendary Sparkles', emoji: '✨', category: 'achievement', price: 1200, rarity: 'legendary', description: 'Pure magic' },
];

const DEFAULT_STICKERS: UserStickers = {
  unlocked: [],
  equipped: [],
};

export function useStickers() {
  const [userStickers, setUserStickers] = useState<UserStickers>(() => {
    const loaded = loadFromStorage<UserStickers>(STICKERS_KEY, DEFAULT_STICKERS);
    return loaded;
  });


  const unlockSticker = useCallback((stickerId: string) => {
    setUserStickers(prev => {
      if (prev.unlocked.includes(stickerId)) return prev;
      
      const newStickers = {
        ...prev,
        unlocked: [...prev.unlocked, stickerId],
      };
      saveToStorage(STICKERS_KEY, newStickers);
      return newStickers;
    });
  }, []);

  const equipSticker = useCallback((stickerId: string) => {
    setUserStickers(prev => {
      if (!prev.unlocked.includes(stickerId)) return prev;
      if (prev.equipped.length >= 4) return prev; // Max 4 equipped
      if (prev.equipped.includes(stickerId)) return prev;
      
      const newStickers = {
        ...prev,
        equipped: [...prev.equipped, stickerId],
      };
      saveToStorage(STICKERS_KEY, newStickers);
      return newStickers;
    });
  }, []);

  const unequipSticker = useCallback((stickerId: string) => {
    setUserStickers(prev => {
      const newStickers = {
        ...prev,
        equipped: prev.equipped.filter(id => id !== stickerId),
      };
      saveToStorage(STICKERS_KEY, newStickers);
      return newStickers;
    });
  }, []);

  const isUnlocked = useCallback((stickerId: string) => {
    return userStickers.unlocked.includes(stickerId);
  }, [userStickers.unlocked]);

  const isEquipped = useCallback((stickerId: string) => {
    return userStickers.equipped.includes(stickerId);
  }, [userStickers.equipped]);

  return {
    userStickers,
    allStickers: ALL_STICKERS,
    unlockSticker,
    equipSticker,
    unequipSticker,
    isUnlocked,
    isEquipped,
  };
}