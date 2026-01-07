"use client"
import { useState, useCallback, useEffect } from "react"
import { saveToStorage, loadFromStorage } from "@/lib/storage"
import type { UserStats } from "@/types"

const STATS_KEY = "user_stats"

const DEFAULT_STATS: UserStats = {
  coins: 0,
  totalPagesRead: 0,
  totalBooksCompleted: 0,
  totalReadingTime: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: "",
  dailyGoalMinutes: 30,
  todayReadingTime: 0,
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS)

   useEffect(() => {
    const loaded = loadFromStorage<UserStats>(STATS_KEY, DEFAULT_STATS)
    const today = getTodayDate()
    if (loaded.lastReadDate !== today) {
      loaded.todayReadingTime = 0
    }

    const raf = requestAnimationFrame(() => {
      setStats(loaded)
    })

    return () => cancelAnimationFrame(raf)
  }, [])


  const updateStats = useCallback((updates: Partial<UserStats>) => {
    setStats((prev) => {
      const newStats = { ...prev, ...updates }
      saveToStorage(STATS_KEY, newStats)
      return newStats
    })
  }, [])

  const addCoins = useCallback((amount: number) => {
    setStats((prev) => {
      const newStats = { ...prev, coins: prev.coins + amount }
      saveToStorage(STATS_KEY, newStats)
      return newStats
    })
  }, [])

  const spendCoins = useCallback(
    (amount: number): boolean => {
      if (stats.coins < amount) return false

      setStats((prev) => {
        const newStats = { ...prev, coins: prev.coins - amount }
        saveToStorage(STATS_KEY, newStats)
        return newStats
      })
      return true
    },
    [stats.coins]
  )

  const recordReading = useCallback(
    (timeSeconds: number, pagesRead: number) => {
      const today = getTodayDate()

      setStats((prev) => {
        let newStreak = prev.currentStreak

        // Check if we need to update streak
        if (prev.lastReadDate !== today) {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split("T")[0]

          if (prev.lastReadDate === yesterdayStr) {
            // Continue streak
            newStreak = prev.currentStreak + 1
          } else if (prev.lastReadDate !== today) {
            // Streak broken, start new
            newStreak = 1
          }
        }

        const newStats: UserStats = {
          ...prev,
          totalReadingTime: prev.totalReadingTime + timeSeconds,
          todayReadingTime:
            (prev.lastReadDate === today ? prev.todayReadingTime : 0) +
            timeSeconds,
          totalPagesRead: prev.totalPagesRead + pagesRead,
          currentStreak: newStreak,
          longestStreak: Math.max(prev.longestStreak, newStreak),
          lastReadDate: today,
        }

        saveToStorage(STATS_KEY, newStats)
        return newStats
      })
    },
    []
  )

  const completeBook = useCallback(() => {
    setStats((prev) => {
      const newStats = {
        ...prev,
        totalBooksCompleted: prev.totalBooksCompleted + 1,
      }
      saveToStorage(STATS_KEY, newStats)
      return newStats
    })
  }, [])

  return {
    stats,
    updateStats,
    addCoins,
    spendCoins,
    recordReading,
    completeBook,
  }
}
