import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { BookCard } from './BookCard';
import { PDFDropZone } from './PDFDropZone';
import type { PDFBook, ReadingProgress } from '@/types';

interface BookLibraryProps {
  books: PDFBook[];
  progressMap: Map<string, ReadingProgress>;
  onAddBook: (file: File) => void;
  onReadBook: (book: PDFBook) => void;
  onDeleteBook: (bookId: string) => void;
}

export function BookLibrary({ 
  books, 
  progressMap, 
  onAddBook, 
  onReadBook, 
  onDeleteBook 
}: BookLibraryProps) {
  if (books.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="p-6 rounded-full bg-secondary mb-6">
          <BookOpen className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-2">Your Library is Empty</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Start your reading journey by uploading your first PDF book
        </p>
        <PDFDropZone onFileAccepted={onAddBook} className="max-w-md w-full" />
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add new book */}
      <PDFDropZone onFileAccepted={onAddBook} className="max-w-2xl mx-auto" />

      {/* Book grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3  xl:grid-cols-4 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              progress={progressMap.get(book.id)}
              onRead={onReadBook}
              onDelete={onDeleteBook}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}