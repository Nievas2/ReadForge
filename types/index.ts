// Core types for ReadQuest

// Agregar estos tipos a tu archivo types.ts existente

export interface Highlight {
  id: string
  pageNumber: number
  color: string
  rects: HighlightRect[]
  text: string
  createdAt: number
}

export interface HighlightRect {
  x: number
  y: number
  width: number
  height: number
}

export interface Annotation {
  bookId: string
  highlights: Highlight[]
  lastModified: number
}

// Actualizar PDFBook para incluir anotaciones
export interface PDFBook {
  id: string
  name: string
  file: ArrayBuffer
  totalPages: number
  addedAt: number
  lastReadAt: number
  cover?: string
}

export interface ReadingProgress {
  bookId: string
  currentPage: number
  totalPages: number
  completedAt?: number
}

export interface UserStats {
  coins: number
  totalPagesRead: number
  totalBooksCompleted: number
  totalReadingTime: number // in seconds
  currentStreak: number
  longestStreak: number
  lastReadDate: string // YYYY-MM-DD
  dailyGoalMinutes: number
  todayReadingTime: number // in seconds
}

export interface Sticker {
  id: string
  name: string
  emoji: string
  category: "book" | "character" | "achievement"
  price: number
  rarity: "common" | "rare" | "epic" | "legendary"
  description: string
}

export interface UserStickers {
  unlocked: string[]
  equipped: string[]
}

export interface ReadingSession {
  bookId: string
  startTime: number
  pageStartTime: number
  currentPage: number
  pagesRead: Set<number>
  coinsEarned: number
  lastActivityTime: number
  isActive: boolean
}

export interface Settings {
  theme: "light" | "dark" | "system"
  readingMode: "normal" | "sepia"
  focusMode: boolean
}

export type ThemeMode = "light" | "dark" | "system"
export type ReadingMode = "normal" | "sepia"
