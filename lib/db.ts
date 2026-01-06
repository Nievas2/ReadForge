import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { PDFBook, ReadingProgress } from '@/types';

interface ReadQuestDB extends DBSchema {
  books: {
    key: string;
    value: PDFBook;
    indexes: { 'by-date': number };
  };
  progress: {
    key: string;
    value: ReadingProgress;
  };
}

const DB_NAME = 'readquest-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ReadQuestDB>> | null = null;

export async function getDB(): Promise<IDBPDatabase<ReadQuestDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ReadQuestDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Books store
        if (!db.objectStoreNames.contains('books')) {
          const bookStore = db.createObjectStore('books', { keyPath: 'id' });
          bookStore.createIndex('by-date', 'addedAt');
        }
        // Progress store
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'bookId' });
        }
      },
    });
  }
  return dbPromise;
}

// Book operations
export async function saveBook(book: PDFBook): Promise<void> {
  const db = await getDB();
  await db.put('books', book);
}

export async function getBook(id: string): Promise<PDFBook | undefined> {
  const db = await getDB();
  return db.get('books', id);
}

export async function getAllBooks(): Promise<PDFBook[]> {
  const db = await getDB();
  return db.getAllFromIndex('books', 'by-date');
}

export async function deleteBook(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('books', id);
  await db.delete('progress', id);
}

// Progress operations
export async function saveProgress(progress: ReadingProgress): Promise<void> {
  const db = await getDB();
  await db.put('progress', progress);
}

export async function getProgress(bookId: string): Promise<ReadingProgress | undefined> {
  const db = await getDB();
  return db.get('progress', bookId);
}

export async function getAllProgress(): Promise<ReadingProgress[]> {
  const db = await getDB();
  return db.getAll('progress');
}

// Generate cover image from first page
export async function generateCover(file: ArrayBuffer): Promise<string> {
  return new Promise((resolve) => {
    // We'll use react-pdf's document loading to generate this
    // For now, return a placeholder
    resolve('');
  });
}