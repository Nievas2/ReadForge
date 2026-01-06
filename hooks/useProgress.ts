"use client"
import { useState, useEffect, useCallback } from 'react';
import { saveProgress, getProgress, getAllProgress } from '@/lib/db';
import type { ReadingProgress } from '@/types';

export function useProgress(bookId?: string) {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [allProgress, setAllProgress] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        if (bookId) {
          const bookProgress = await getProgress(bookId);
          setProgress(bookProgress || null);
        }
        const all = await getAllProgress();
        setAllProgress(all);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, [bookId]);

  const updateProgress = useCallback(async (bookId: string, currentPage: number, totalPages: number) => {
    const newProgress: ReadingProgress = {
      bookId,
      currentPage,
      totalPages,
      completedAt: currentPage >= totalPages ? Date.now() : undefined,
    };
    
    await saveProgress(newProgress);
    setProgress(newProgress);
    
    // Update allProgress
    setAllProgress(prev => {
      const existing = prev.findIndex(p => p.bookId === bookId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newProgress;
        return updated;
      }
      return [...prev, newProgress];
    });
  }, []);

  const getBookProgress = useCallback((bookId: string): ReadingProgress | undefined => {
    return allProgress.find(p => p.bookId === bookId);
  }, [allProgress]);

  return {
    progress,
    allProgress,
    loading,
    updateProgress,
    getBookProgress,
  };
}