"use"
import { useState, useCallback, useRef, useEffect } from "react"
import type { ReadingSession } from "@/types"

const MIN_TIME_PER_PAGE = 30 // seconds
const COINS_PER_MINUTE = 1
const COINS_PER_PAGE = 2
const PAGE_MILESTONE_BONUS = 5 // every 10 pages
const BOOK_COMPLETION_BONUS = 50
const INACTIVITY_TIMEOUT = 60 // seconds

interface UseReadingSessionProps {
  bookId: string
  onCoinsEarned: (amount: number) => void
  onRecordReading: (timeSeconds: number, pagesRead: number) => void
}

export function useReadingSession({
  bookId,
  onCoinsEarned,
  onRecordReading,
}: UseReadingSessionProps) {
  const [session, setSession] = useState<ReadingSession>(() => {
    const session = {
      bookId,
      startTime: Date.now(),
      pageStartTime: Date.now(),
      currentPage: 1,
      pagesRead: new Set<number>(),
      coinsEarned: 0,
      lastActivityTime: Date.now(),
      isActive: true,
    }
    return session
  })

  const pendingCoins = useRef(0)
  const lastRecordedTime = useRef<number | null>(null)
  const activityCheckInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (lastRecordedTime.current === null) {
      lastRecordedTime.current = Date.now()
    }
  }, [])

  // Track user activity
  const recordActivity = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      lastActivityTime: Date.now(),
      isActive: true,
    }))
  }, [])

  // Check for inactivity
  useEffect(() => {
    activityCheckInterval.current = setInterval(() => {
      setSession((prev) => {
        const timeSinceActivity = (Date.now() - prev.lastActivityTime) / 1000
        if (timeSinceActivity > INACTIVITY_TIMEOUT && prev.isActive) {
          return { ...prev, isActive: false }
        }
        return prev
      })
    }, 5000)

    return () => {
      if (activityCheckInterval.current) {
        clearInterval(activityCheckInterval.current)
      }
    }
  }, [])

  // Award time-based coins every minute (only when active)
  useEffect(() => {
    const interval = setInterval(() => {
      setSession((prev) => {
        if (!prev.isActive) return prev

        const last = lastRecordedTime.current ?? Date.now()
        const timeElapsed = (Date.now() - last) / 1000
        if (timeElapsed >= 60) {
          const minutesElapsed = Math.floor(timeElapsed / 60)
          const coinsToAdd = minutesElapsed * COINS_PER_MINUTE

          pendingCoins.current += coinsToAdd
          onCoinsEarned(coinsToAdd)
          lastRecordedTime.current = Date.now()

          return {
            ...prev,
            coinsEarned: prev.coinsEarned + coinsToAdd,
          }
        }
        return prev
      })
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [onCoinsEarned])

  const changePage = useCallback(
    (newPage: number, totalPages: number) => {
      setSession((prev) => {
        const timeOnPage = (Date.now() - prev.pageStartTime) / 1000
        let coinsToAdd = 0
        let pagesReadCount = 0

        // Only award page completion if enough time spent and user was active
        if (
          timeOnPage >= MIN_TIME_PER_PAGE &&
          !prev.pagesRead.has(prev.currentPage)
        ) {
          coinsToAdd += COINS_PER_PAGE
          pagesReadCount = 1

          // Milestone bonus
          const newPagesRead = prev.pagesRead.size + 1
          if (newPagesRead % 10 === 0) {
            coinsToAdd += PAGE_MILESTONE_BONUS
          }

          // Book completion bonus
          if (newPage === totalPages && !prev.pagesRead.has(totalPages)) {
            coinsToAdd += BOOK_COMPLETION_BONUS
          }

          if (coinsToAdd > 0) {
            onCoinsEarned(coinsToAdd)
          }

          if (pagesReadCount > 0) {
            onRecordReading(Math.floor(timeOnPage), pagesReadCount)
          }
        }

        const newPagesRead = new Set(prev.pagesRead)
        if (timeOnPage >= MIN_TIME_PER_PAGE) {
          newPagesRead.add(prev.currentPage)
        }

        return {
          ...prev,
          currentPage: newPage,
          pageStartTime: Date.now(),
          pagesRead: newPagesRead,
          coinsEarned: prev.coinsEarned + coinsToAdd,
          lastActivityTime: Date.now(),
          isActive: true,
        }
      })
    },
    [onCoinsEarned, onRecordReading]
  )

  const endSession = useCallback(() => {
    const totalTime = Math.floor((Date.now() - session.startTime) / 1000)
    return {
      totalTime,
      pagesRead: session.pagesRead.size,
      coinsEarned: session.coinsEarned,
    }
  }, [session])

  return {
    session,
    recordActivity,
    changePage,
    endSession,
  }
}
