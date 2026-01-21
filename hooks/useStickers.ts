"use client"
import { useState, useCallback } from 'react';
import { saveToStorage, loadFromStorage } from '@/lib/storage';
import type { Sticker, UserStickers } from '@/types';

const STICKERS_KEY = 'user_stickers';

// All available stickers in the shop
export const ALL_STICKERS: Sticker[] = [
  // Book-themed (common)
  { id: 'book_open', name: 'Libro abierto', emoji: '📖', category: 'book', price: 50, rarity: 'common', description: 'Un clásico libro abierto' },
  { id: 'book_closed', name: 'Libro cerrado', emoji: '📕', category: 'book', price: 50, rarity: 'common', description: 'Un hermoso libro rojo' },
  { id: 'bookmark', name: 'Marcapáginas', emoji: '🔖', category: 'book', price: 75, rarity: 'common', description: 'Nunca pierdas tu página' },
  { id: 'glasses', name: 'Anteojos para leer', emoji: '👓', category: 'book', price: 100, rarity: 'common', description: 'Para el lector estudioso' },
  
  // Book-themed (Rare)
  { id: 'book_stack', name: 'Pila de libros', emoji: '📚', category: 'book', price: 200, rarity: 'rare', description: 'Una pila de conocimiento' },
  { id: 'quill', name: 'Pluma de escribir', emoji: '🪶', category: 'book', price: 250, rarity: 'rare', description: 'Escribe tu propia historia' },
  { id: 'scroll', name: 'Pergamino antiguo', emoji: '📜', category: 'book', price: 300, rarity: 'rare', description: 'Sabiduría de los tiempos' },
  
  // Cute Characters (common)
  { id: 'owl', name: 'Búho sabio', emoji: '🦉', category: 'character', price: 100, rarity: 'common', description: 'Un compañero de lectura sabio' },
  { id: 'cat', name: 'Gato lector', emoji: '🐱', category: 'character', price: 100, rarity: 'common', description: 'Compañero acogedor para leer' },
  { id: 'bunny', name: 'Conejo ratón de biblioteca', emoji: '🐰', category: 'character', price: 100, rarity: 'common', description: 'Salta de página en página' },
  
  // Cute Characters (Rare)
  { id: 'fox', name: 'Zorro astuto', emoji: '🦊', category: 'character', price: 250, rarity: 'rare', description: 'Inteligente y veloz' },
  { id: 'dragon', name: 'Dragón de libros', emoji: '🐉', category: 'character', price: 400, rarity: 'rare', description: 'Guarda tu biblioteca' },
  
  // Cute Characters (Epic)
  { id: 'unicorn', name: 'Unicornio mágico', emoji: '🦄', category: 'character', price: 600, rarity: 'epic', description: 'Aporta magia a la lectura' },
  { id: 'phoenix', name: 'Lector fénix', emoji: '🔥', category: 'character', price: 750, rarity: 'epic', description: 'Resurge a través de las historias' },
  
  // Achievement Badges (common)
  { id: 'star', name: 'Estrella dorada', emoji: '⭐', category: 'achievement', price: 75, rarity: 'common', description: '¡Lo hiciste genial!' },
  { id: 'medal', name: 'Medalla de lector', emoji: '🏅', category: 'achievement', price: 100, rarity: 'common', description: 'Primer puesto como lector' },
  
  // Achievement Badges (Rare)
  { id: 'trophy', name: 'Trofeo de campeón', emoji: '🏆', category: 'achievement', price: 300, rarity: 'rare', description: 'Campeón de lectura' },
  { id: 'crown', name: 'Corona real', emoji: '👑', category: 'achievement', price: 350, rarity: 'rare', description: 'Realeza de los lectores' },
  
  // Achievement Badges (Epic)
  { id: 'diamond', name: 'Lector diamante', emoji: '💎', category: 'achievement', price: 500, rarity: 'epic', description: 'Logro precioso' },
  { id: 'rocket', name: 'Lector cohete', emoji: '🚀', category: 'achievement', price: 600, rarity: 'epic', description: 'Lectura que llega al cielo' },
  
  // Achievement Badges (Legendary)
  { id: 'infinity', name: 'Lector infinito', emoji: '♾️', category: 'achievement', price: 1000, rarity: 'legendary', description: 'Dedicación sin fin' },
  { id: 'sparkles', name: 'Destellos legendarys', emoji: '✨', category: 'achievement', price: 1200, rarity: 'legendary', description: 'Pura magia' },
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