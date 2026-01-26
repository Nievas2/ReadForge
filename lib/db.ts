import { openDB, DBSchema, IDBPDatabase } from "idb"
import type { PDFBook, ReadingProgress, Annotation } from "@/types"

interface ReadQuestDB extends DBSchema {
  books: {
    key: string
    value: PDFBook
    indexes: { "by-date": number }
  }
  progress: {
    key: string
    value: ReadingProgress
  }
  annotations: {
    key: string
    value: Annotation
  }
}

const DB_NAME = "readquest-db"
const DB_VERSION = 2

let dbPromise: Promise<IDBPDatabase<ReadQuestDB>> | null = null

export async function getDB(): Promise<IDBPDatabase<ReadQuestDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ReadQuestDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Books store
        if (!db.objectStoreNames.contains("books")) {
          const bookStore = db.createObjectStore("books", { keyPath: "id" })
          bookStore.createIndex("by-date", "addedAt")
        }
        // Progress store
        if (!db.objectStoreNames.contains("progress")) {
          db.createObjectStore("progress", { keyPath: "bookId" })
        }
        // Annotations store
        if (!db.objectStoreNames.contains("annotations")) {
          db.createObjectStore("annotations", { keyPath: "bookId" })
        }
      },
    })
  }
  return dbPromise
}

// Book operations
export async function saveBook(book: PDFBook): Promise<void> {
  const db = await getDB()
  const existingBook = await db.get("books", book.id)

  let fileToSave: ArrayBuffer | null = null

  if (book.file instanceof ArrayBuffer && book.file.byteLength > 0) {
    fileToSave = book.file.slice(0)
  } else if (existingBook && existingBook.file instanceof ArrayBuffer) {
    fileToSave = existingBook.file // Reutilizamos el que ya está en DB
  }

  if (!fileToSave) {
    throw new Error("Archivo no disponible")
  }

  // IMPORTANTE: Clonamos el objeto pero inyectamos el buffer sano
  await db.put("books", {
    ...book,
    file: fileToSave,
  })
}

export async function getBook(id: string): Promise<PDFBook | undefined> {
  const db = await getDB()
  return db.get("books", id)
}

export async function getAllBooks(): Promise<PDFBook[]> {
  const db = await getDB()
  return db.getAllFromIndex("books", "by-date")
}

export async function deleteBook(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("books", id)
  await db.delete("progress", id)
  await db.delete("annotations", id)
}

// Progress operations
export async function saveProgress(progress: ReadingProgress): Promise<void> {
  const db = await getDB()
  await db.put("progress", progress)
}

export async function getProgress(
  bookId: string,
): Promise<ReadingProgress | undefined> {
  const db = await getDB()
  return db.get("progress", bookId)
}

export async function getAllProgress(): Promise<ReadingProgress[]> {
  const db = await getDB()
  return db.getAll("progress")
}

// Annotation operations
export async function saveAnnotations(annotation: Annotation): Promise<void> {
  const db = await getDB()
  await db.put("annotations", annotation)
}

export async function getAnnotations(
  bookId: string,
): Promise<Annotation | undefined> {
  const db = await getDB()
  return db.get("annotations", bookId)
}

// Generate cover image from first page
export async function generateCover(file: ArrayBuffer): Promise<string> {
  return new Promise((resolve) => {
    resolve("")
  })
}
