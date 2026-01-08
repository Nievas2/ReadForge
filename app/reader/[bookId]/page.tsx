"use client"
import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PDFReader } from "@/components/reader/PDFReader"
import { getBook } from "@/lib/db"
import { useUserStats } from "@/hooks/useUserStats"
import { useStickers, ALL_STICKERS } from "@/hooks/useStickers"
import { useProgress } from "@/hooks/useProgress"
import { useToast } from "@/hooks/use-toast"
import { CoinAnimation } from "@/components/gamification/CoinDisplay"
import type { PDFBook } from "@/types"

export default function ReaderPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.bookId as string

  const [book, setBook] = useState<PDFBook | null>(null)
  const [loading, setLoading] = useState(true)

  const { stats, addCoins, recordReading, completeBook } = useUserStats()
  const { userStickers } = useStickers()
  const { updateProgress, getBookProgress } = useProgress()
  const { toast } = useToast()

  const [coinAnimation, setCoinAnimation] = useState<{
    show: boolean
    amount: number
  }>({ show: false, amount: 0 })

  // Load book from IndexedDB
  useEffect(() => {
    let mounted = true

    const loadBook = async () => {
      try {
        const loadedBook = await getBook(bookId)
        if (mounted) {
          if (loadedBook) {
            setBook(loadedBook)
          } else {
            router.push("/")
            toast({
              title: "Book Not Found",
              description: "The requested book could not be found.",
            })
          }
          setLoading(false)
        }
      } catch (error) {
        console.error("Failed to load book:", error)
        if (mounted) {
          router.push("/")
          toast({
            title: "Error Loading Book",
            description: "There was an error loading the book.",
          })
          setLoading(false)
        }
      }
    }

    loadBook()

    return () => {
      mounted = false
    }
  }, [bookId, router, toast])

  // Get equipped sticker emojis
  const equippedStickerEmojis = userStickers.equipped
    .map((id) => ALL_STICKERS.find((s) => s.id === id)?.emoji)
    .filter(Boolean) as string[]

  const handleCoinsEarned = useCallback(
    (amount: number) => {
      addCoins(amount)
      setCoinAnimation({ show: true, amount })
      setTimeout(() => setCoinAnimation({ show: false, amount: 0 }), 600)
    },
    [addCoins]
  )

  const handleRecordReading = useCallback(
    (time: number, pages: number) => {
      recordReading(time, pages)
    },
    [recordReading]
  )

  const handleProgressUpdate = (
    bookId: string,
    page: number,
    total: number
  ) => {
    updateProgress(bookId, page, total)

    // Check if book completed
    if (page >= total) {
      completeBook()
      toast({
        title: "🎉 Book Completed!",
        description: `You've earned ${50} bonus coins!`,
      })
    }
  }

  const handleBookUpdate = async (
    bookId: string,
    updates: Partial<PDFBook>
  ) => {
    if (!book) return

    try {
      const { saveBook } = await import("@/lib/db")
      const updated = { ...book, ...updates }
      await saveBook(updated)
      setBook(updated)
    } catch (error) {
      console.error("Failed to update book:", error)
    }
  }

  const handleClose = () => {
    router.push("/")
  }

  // Update last read time on mount
  useEffect(() => {
    if (book) {
      handleBookUpdate(book.id, { lastReadAt: Date.now() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id])

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">
          Loading book...
        </div>
      </div>
    )
  }

  if (!book) {
    return null
  }

  return (
    <>
      <PDFReader
        book={book}
        initialProgress={getBookProgress(book.id)}
        coins={stats.coins}
        equippedStickers={equippedStickerEmojis}
        onClose={handleClose}
        onProgressUpdate={handleProgressUpdate}
        onCoinsEarned={handleCoinsEarned}
        onRecordReading={handleRecordReading}
        onBookUpdate={handleBookUpdate}
      />
      <CoinAnimation show={coinAnimation.show} amount={coinAnimation.amount} />
    </>
  )
}
