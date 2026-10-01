import type { UserStats } from "@/types"
import { loadFromStorage, saveToStorage } from "@/lib/storage"

const ACHIEVEMENTS_KEY = "unlocked_achievements"
export const ACHIEVEMENT_UNLOCKED_EVENT = "readforge:achievement-unlocked"

export interface Achievement {
  id: string
  title: string
  description: string
  metric: "pages" | "books" | "streak" | "dailyGoal" | "readingTime"
  target: number
}

export const ACHIEVEMENT_CATALOG: {
  achievement: Achievement
  isUnlocked: (stats: UserStats) => boolean
}[] = [
  {
    achievement: {
      id: "first-page",
      title: "Primera página",
      description: "Diste el primer paso de una nueva aventura.",
      metric: "pages",
      target: 1,
    },
    isUnlocked: (stats) => stats.totalPagesRead >= 1,
  },
  {
    achievement: {
      id: "pages-100",
      title: "Lector constante",
      description: "Ya leíste 100 páginas.",
      metric: "pages",
      target: 100,
    },
    isUnlocked: (stats) => stats.totalPagesRead >= 100,
  },
  {
    achievement: {
      id: "pages-500",
      title: "Entre historias",
      description: "Ya leíste 500 páginas.",
      metric: "pages",
      target: 500,
    },
    isUnlocked: (stats) => stats.totalPagesRead >= 500,
  },
  {
    achievement: {
      id: "first-book",
      title: "Fin de un capítulo",
      description: "Completaste tu primer libro.",
      metric: "books",
      target: 1,
    },
    isUnlocked: (stats) => stats.totalBooksCompleted >= 1,
  },
  {
    achievement: {
      id: "books-5",
      title: "Coleccionista de historias",
      description: "Completaste 5 libros.",
      metric: "books",
      target: 5,
    },
    isUnlocked: (stats) => stats.totalBooksCompleted >= 5,
  },
  {
    achievement: {
      id: "streak-3",
      title: "Ritmo de lectura",
      description: "Leíste durante 3 días seguidos.",
      metric: "streak",
      target: 3,
    },
    isUnlocked: (stats) => stats.currentStreak >= 3,
  },
  {
    achievement: {
      id: "streak-7",
      title: "Una semana de historias",
      description: "Mantuviste una racha de 7 días.",
      metric: "streak",
      target: 7,
    },
    isUnlocked: (stats) => stats.currentStreak >= 7,
  },
  {
    achievement: {
      id: "daily-goal",
      title: "Objetivo cumplido",
      description: "Alcanzaste tu objetivo diario de lectura.",
      metric: "dailyGoal",
      target: 1,
    },
    isUnlocked: (stats) => stats.todayReadingTime >= stats.dailyGoalMinutes * 60,
  },
  {
    achievement: {
      id: "reading-hour",
      title: "Una hora entre páginas",
      description: "Acumulaste una hora de lectura.",
      metric: "readingTime",
      target: 60 * 60,
    },
    isUnlocked: (stats) => stats.totalReadingTime >= 60 * 60,
  },
]

export function unlockAchievementsForStats(stats: UserStats): void {
  if (typeof window === "undefined") return

  const unlockedIds = loadFromStorage<string[]>(ACHIEVEMENTS_KEY, [])
  const newlyUnlocked = ACHIEVEMENT_CATALOG
    .filter(({ achievement, isUnlocked }) =>
      !unlockedIds.includes(achievement.id) && isUnlocked(stats),
    )
    .map(({ achievement }) => achievement)

  if (newlyUnlocked.length === 0) return

  saveToStorage(ACHIEVEMENTS_KEY, [
    ...unlockedIds,
    ...newlyUnlocked.map((achievement) => achievement.id),
  ])
  queueMicrotask(() => {
    window.dispatchEvent(
      new CustomEvent<Achievement[]>(ACHIEVEMENT_UNLOCKED_EVENT, {
        detail: newlyUnlocked,
      }),
    )
  })
}