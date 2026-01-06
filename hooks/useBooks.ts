"use client"
import { useState, useEffect, useCallback } from 'react';
import { getAllBooks, saveBook, deleteBook as deleteBookFromDB, getBook } from '@/lib/db';
import type { PDFBook } from '@/types';

export function useBooks() {
  const [books, setBooks] = useState<PDFBook[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBooks = useCallback(async () => {
    try {
      const allBooks = await getAllBooks();
      setBooks(allBooks.sort((a, b) => b.lastReadAt - a.lastReadAt));
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const addBook = useCallback(async (file: File): Promise<PDFBook | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const id = crypto.randomUUID();
      
      const book: PDFBook = {
        id,
        name: file.name.replace(/\.pdf$/i, ''),
        file: arrayBuffer,
        totalPages: 0, // Will be set after PDF loads
        addedAt: Date.now(),
        lastReadAt: Date.now(),
      };

      await saveBook(book);
      await loadBooks();
      return book;
    } catch (error) {
      console.error('Failed to add book:', error);
      return null;
    }
  }, [loadBooks]);

  const updateBook = useCallback(async (id: string, updates: Partial<PDFBook>) => {
    try {
      const existing = await getBook(id);
      if (existing) {
        const updated = { ...existing, ...updates };
        await saveBook(updated);
        await loadBooks();
      }
    } catch (error) {
      console.error('Failed to update book:', error);
    }
  }, [loadBooks]);

  const deleteBook = useCallback(async (id: string) => {
    try {
      await deleteBookFromDB(id);
      await loadBooks();
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  }, [loadBooks]);

  return {
    books,
    loading,
    addBook,
    updateBook,
    deleteBook,
    refreshBooks: loadBooks,
  };
}