"use client"
import { useState, useCallback, useEffect } from 'react';
import { saveToStorage, loadFromStorage } from '@/lib/storage';
import type { Sticker, StickerCorner, StickerPlacement, UserStickers } from '@/types';

const STICKERS_KEY = 'user_stickers';
const STICKERS_UPDATED_EVENT = 'readforge:user-stickers-updated';
const STICKER_MOVE_EVENT = 'readforge:sticker-move';
export const STAT_STICKER_TARGETS = [
  'stat:daily-goal',
  'stat:reading-time',
  'stat:pages-read',
  'stat:books-completed',
] as const;
const STICKER_CORNERS: StickerCorner[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

// All available stickers in the shop
export const ALL_STICKERS: Sticker[] = [
  // Book-themed (common)
  { id: 'book_open', name: 'Libro abierto', emoji: '📖', category: 'book', price: 1, rarity: 'common', description: 'Un clásico libro abierto' },
  { id: 'book_closed', name: 'Libro cerrado', emoji: '📕', category: 'book', price: 1, rarity: 'common', description: 'Un hermoso libro rojo' },
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
  bookPlacements: {},
  placements: {},
};

function migrateStickers(loaded: UserStickers): UserStickers {
  if (loaded.placements) return loaded;

  const placements: Record<string, StickerPlacement> = {};
  Object.entries(loaded.bookPlacements ?? {}).forEach(([bookId, placement]) => {
    placements[placement.stickerId] = {
      targetId: `book:${bookId}`,
      corner: placement.corner,
    };
  });

  let equipped = loaded.equipped.slice(0, STAT_STICKER_TARGETS.length);
  equipped.forEach((stickerId) => {
    Object.assign(placements, placeOnFirstAvailableStat(placements, stickerId));
  });

  loaded.unlocked.forEach((stickerId) => {
    if (equipped.length >= STAT_STICKER_TARGETS.length) return;
    if (!equipped.includes(stickerId)) equipped = [...equipped, stickerId];
    Object.assign(placements, placeOnFirstAvailableStat(placements, stickerId));
  });

  return { ...loaded, equipped, placements };
}

function placeOnFirstAvailableStat(
  placements: Record<string, StickerPlacement>,
  stickerId: string,
) {
  if (placements[stickerId]) return placements;
  const targetId = STAT_STICKER_TARGETS.find(
    (target) => !Object.values(placements).some((placement) => placement.targetId === target),
  );
  return targetId
    ? { ...placements, [stickerId]: { targetId, corner: 'top-right' as const } }
    : placements;
}

function getLegacyBookPlacements(placements: Record<string, StickerPlacement>) {
  return Object.fromEntries(
    Object.entries(placements)
      .filter(([, placement]) => placement.targetId.startsWith('book:'))
      .map(([stickerId, placement]) => [
        placement.targetId.slice('book:'.length),
        { stickerId, corner: placement.corner },
      ]),
  );
}

function persistStickers(stickers: UserStickers) {
  saveToStorage(STICKERS_KEY, stickers);
  if (typeof window !== 'undefined') {
    queueMicrotask(() => {
      window.dispatchEvent(
        new CustomEvent(STICKERS_UPDATED_EVENT, { detail: stickers }),
      );
    });
  }
}

export function useStickers() {
  const [userStickers, setUserStickers] = useState<UserStickers>(() => {
    const loaded = loadFromStorage<UserStickers>(STICKERS_KEY, DEFAULT_STICKERS);
    return {
      ...DEFAULT_STICKERS,
      ...migrateStickers(loaded),
      bookPlacements: loaded.bookPlacements ?? {},
    };
  });
  const [movingStickerId, setMovingStickerId] = useState<string | null>(null);

  useEffect(() => {
    const syncStickers = (event: Event) => {
      const updated = (event as CustomEvent<UserStickers>).detail;
      if (updated) setUserStickers(updated);
    };
    const syncMoveState = (event: Event) => {
      setMovingStickerId((event as CustomEvent<string | null>).detail);
    };

    window.addEventListener(STICKERS_UPDATED_EVENT, syncStickers);
    window.addEventListener(STICKER_MOVE_EVENT, syncMoveState);
    return () => {
      window.removeEventListener(STICKERS_UPDATED_EVENT, syncStickers);
      window.removeEventListener(STICKER_MOVE_EVENT, syncMoveState);
    };
  }, []);

  useEffect(() => {
    const stored = loadFromStorage<UserStickers>(STICKERS_KEY, DEFAULT_STICKERS);
    if (!stored.placements) persistStickers(userStickers);
  }, [userStickers]);

  const beginStickerMove = useCallback((stickerId: string) => {
    window.dispatchEvent(new CustomEvent(STICKER_MOVE_EVENT, { detail: stickerId }));
  }, []);

  const cancelStickerMove = useCallback(() => {
    window.dispatchEvent(new CustomEvent(STICKER_MOVE_EVENT, { detail: null }));
  }, []);

  const placeSticker = useCallback((stickerId: string, targetId: string, corner?: StickerCorner) => {
    setUserStickers((prev) => {
      if (!prev.unlocked.includes(stickerId)) return prev;

      const placements = prev.placements ?? migrateStickers(prev).placements ?? {};
      const currentPlacement = placements[stickerId];
      if (Object.entries(placements).some(
        ([id, placement]) => id !== stickerId && placement.targetId === targetId,
      )) return prev;

      const occupiedCorners = new Set(
        Object.entries(placements)
          .filter(([id, placement]) => id !== stickerId && placement.targetId === targetId)
          .map(([, placement]) => placement.corner),
      );
      const candidateCorners = corner ? [corner] : [currentPlacement?.corner, ...STICKER_CORNERS];
      const selectedCorner = candidateCorners.find(
        (value): value is StickerCorner => Boolean(value) && !occupiedCorners.has(value),
      );
      if (!selectedCorner) return prev;

      const nextPlacements = {
        ...placements,
        [stickerId]: { targetId, corner: selectedCorner },
      };
      const nextStickers = {
        ...prev,
        placements: nextPlacements,
        bookPlacements: getLegacyBookPlacements(nextPlacements),
      };
      persistStickers(nextStickers);
      return nextStickers;
    });
  }, []);

  const removeStickerPlacement = useCallback((stickerId: string) => {
    setUserStickers((prev) => {
      const placements = { ...(prev.placements ?? migrateStickers(prev).placements ?? {}) };
      if (!placements[stickerId]) return prev;
      delete placements[stickerId];
      const nextStickers = {
        ...prev,
        placements,
        bookPlacements: getLegacyBookPlacements(placements),
      };
      persistStickers(nextStickers);
      return nextStickers;
    });
  }, []);


  const unlockSticker = useCallback((stickerId: string) => {
    setUserStickers(prev => {
      if (prev.unlocked.includes(stickerId)) return prev;
      
      const equipped = prev.equipped.length < 4
        ? [...prev.equipped, stickerId]
        : prev.equipped;
      const currentPlacements = prev.placements ?? migrateStickers(prev).placements ?? {};
      const placements = equipped.includes(stickerId)
        ? placeOnFirstAvailableStat(currentPlacements, stickerId)
        : currentPlacements;
      const newStickers = {
        ...prev,
        unlocked: [...prev.unlocked, stickerId],
        equipped,
        placements,
      };
      persistStickers(newStickers);
      return newStickers;
    });
  }, []);

  const equipSticker = useCallback((stickerId: string) => {
    setUserStickers(prev => {
      if (!prev.unlocked.includes(stickerId)) return prev;
      if (prev.equipped.length >= 4) return prev; // Max 4 equipped
      if (prev.equipped.includes(stickerId)) return prev;
      
      const placements = placeOnFirstAvailableStat(
        prev.placements ?? migrateStickers(prev).placements ?? {},
        stickerId,
      );
      const newStickers = {
        ...prev,
        equipped: [...prev.equipped, stickerId],
        placements,
      };
      persistStickers(newStickers);
      return newStickers;
    });
  }, []);

  const unequipSticker = useCallback((stickerId: string) => {
    setUserStickers(prev => {
      const newStickers = {
        ...prev,
        equipped: prev.equipped.filter(id => id !== stickerId),
        placements: prev.placements?.[stickerId]?.targetId.startsWith('stat:')
          ? Object.fromEntries(Object.entries(prev.placements).filter(([id]) => id !== stickerId))
          : prev.placements,
      };
      persistStickers(newStickers);
      return newStickers;
    });
  }, []);

  const setBookSticker = useCallback((bookId: string, stickerId: string) => {
    placeSticker(stickerId, `book:${bookId}`);
  }, [placeSticker]);

  const setBookStickerCorner = useCallback((bookId: string, corner: StickerCorner) => {
    const stickerId = userStickers.placements
      ? Object.entries(userStickers.placements).find(([, placement]) => placement.targetId === `book:${bookId}`)?.[0]
      : undefined;
    if (stickerId) placeSticker(stickerId, `book:${bookId}`, corner);
  }, [placeSticker, userStickers.placements]);

  const removeBookSticker = useCallback((bookId: string) => {
    const stickerId = userStickers.placements
      ? Object.entries(userStickers.placements).find(([, placement]) => placement.targetId === `book:${bookId}`)?.[0]
      : undefined;
    if (stickerId) removeStickerPlacement(stickerId);
  }, [removeStickerPlacement, userStickers.placements]);

  const isUnlocked = useCallback((stickerId: string) => {
    return userStickers.unlocked.includes(stickerId);
  }, [userStickers.unlocked]);

  const isEquipped = useCallback((stickerId: string) => {
    return userStickers.equipped.includes(stickerId);
  }, [userStickers.equipped]);

  return {
    userStickers,
    movingStickerId,
    allStickers: ALL_STICKERS,
    beginStickerMove,
    cancelStickerMove,
    placeSticker,
    removeStickerPlacement,
    unlockSticker,
    equipSticker,
    unequipSticker,
    setBookSticker,
    setBookStickerCorner,
    removeBookSticker,
    isUnlocked,
    isEquipped,
  };
}