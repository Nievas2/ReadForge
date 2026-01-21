"use client"
import { useState, useEffect, useCallback } from 'react';
import { getAnnotations, saveAnnotations } from '@/lib/db';
import type { Highlight, Annotation, HighlightRect } from '@/types';

export function useAnnotations(bookId: string) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedColor, setSelectedColor] = useState('#ffeb3b');

  useEffect(() => {
    loadAnnotations();
  }, [bookId]);

  const loadAnnotations = async () => {
    const annotation = await getAnnotations(bookId);
    if (annotation) {
      setHighlights(annotation.highlights);
    }
  };

  const saveHighlights = async (newHighlights: Highlight[]) => {
    const annotation: Annotation = {
      bookId,
      highlights: newHighlights,
      lastModified: Date.now(),
    };
    await saveAnnotations(annotation);
    setHighlights(newHighlights);
  };

  const addHighlight = useCallback((
    pageNumber: number,
    rects: HighlightRect[],
    text: string
  ) => {
    const newHighlight: Highlight = {
      id: crypto.randomUUID(),
      pageNumber,
      color: selectedColor,
      rects,
      text,
      createdAt: Date.now(),
    };
    const newHighlights = [...highlights, newHighlight];
    saveHighlights(newHighlights);
  }, [highlights, selectedColor, bookId]);

  const removeHighlight = useCallback((highlightId: string) => {
    const newHighlights = highlights.filter(h => h.id !== highlightId);
    saveHighlights(newHighlights);
  }, [highlights, bookId]);

  const clearAllHighlights = useCallback(() => {
    saveHighlights([]);
  }, [bookId]);

  return {
    highlights,
    selectedColor,
    setSelectedColor,
    addHighlight,
    removeHighlight,
    clearAllHighlights,
  };
}