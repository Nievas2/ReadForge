"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { BookLibrary } from "@/components/library/BookLibrary"
import { StatsCards } from "@/components/gamification/StatsCards"
import { StickerGrid } from "@/components/gamification/StickerShop"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useBooks } from "@/hooks/useBooks"
import { useUserStats } from "@/hooks/useUserStats"
import { useStickers, ALL_STICKERS } from "@/hooks/useStickers"
import { useProgress } from "@/hooks/useProgress"
import { useTheme } from "@/hooks/useTheme"
import { useToast } from "@/hooks/use-toast"
import type { PDFBook, Sticker } from "@/types"

export default function Dashboard() {
  const router = useRouter()
  const [shopOpen, setShopOpen] = useState(false)
  const [stickerCategory, setStickerCategory] = useState<
    "all" | "book" | "character" | "achievement"
  >("all")

  const { books, addBook, deleteBook } = useBooks()
  const { stats, spendCoins } = useUserStats()
  const { userStickers, unlockSticker, equipSticker, unequipSticker } =
    useStickers()
  const { allProgress } = useProgress()
  const { theme, toggleTheme } = useTheme()
  const { toast } = useToast()

  // Create progress map for library
  const progressMap = useMemo(() => {
    const map = new Map()
    allProgress.forEach((p) => map.set(p.bookId, p))
    return map
  }, [allProgress])

  const handleAddBook = useCallback(
    async (file: File) => {
      const book = await addBook(file)
      if (book) {
        toast({
          title: "Book Added",
          description: `"${book.name}" has been added to your library.`,
        })
      }
    },
    [addBook, toast]
  )

  const handleReadBook = useCallback(
    (book: PDFBook) => {
      router.push(`/reader/${book.id}`)
    },
    [router]
  )

  const handleDeleteBook = useCallback(
    (bookId: string) => {
      deleteBook(bookId)
      toast({
        title: "Book Removed",
        description: "The book has been removed from your library.",
      })
    },
    [deleteBook, toast]
  )

  const handleBuySticker = useCallback(
    (sticker: Sticker) => {
      if (spendCoins(sticker.price)) {
        unlockSticker(sticker.id)
        toast({
          title: "Sticker Unlocked!",
          description: `You've unlocked "${sticker.name}" ${sticker.emoji}`,
        })
      } else {
        toast({
          title: "Not Enough Coins",
          description: `You need ${sticker.price} coins to unlock this sticker.`,
        })
      }
    },
    [spendCoins, unlockSticker, toast]
  )

  const handleEquipSticker = useCallback(
    (stickerId: string) => {
      if (userStickers.equipped.length >= 4) {
        toast({
          title: "Maximum Stickers",
          description: "You can only equip up to 4 stickers.",
        })
        return
      }
      equipSticker(stickerId)
    },
    [equipSticker, userStickers.equipped.length, toast]
  )

  return (
    <div className="min-h-screen bg-background">
      <Header
        coins={stats.coins}
        streak={stats.currentStreak}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenShop={() => setShopOpen(true)}
      />

      <main className="container px-4 py-8">
        {/* Stats Overview */}
        <section className="mb-8">
          <StatsCards stats={stats} />
        </section>

        {/* Library */}
        <section>
          <h2 className="font-display text-2xl font-semibold mb-6">
            Your Library
          </h2>
          <BookLibrary
            books={books}
            progressMap={progressMap}
            onAddBook={handleAddBook}
            onReadBook={handleReadBook}
            onDeleteBook={handleDeleteBook}
          />
        </section>
      </main>

      {/* Sticker Shop Dialog */}
      <Dialog open={shopOpen} onOpenChange={setShopOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Sticker Shop
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={stickerCategory}
            onValueChange={(v) => setStickerCategory(v as any)}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="book">📚 Books</TabsTrigger>
              <TabsTrigger value="character">🐾 Characters</TabsTrigger>
              <TabsTrigger value="achievement">🏆 Badges</TabsTrigger>
            </TabsList>

            <TabsContent value={stickerCategory}>
              <StickerGrid
                stickers={ALL_STICKERS}
                unlockedIds={userStickers.unlocked}
                equippedIds={userStickers.equipped}
                coins={stats.coins}
                onBuy={handleBuySticker}
                onEquip={handleEquipSticker}
                onUnequip={unequipSticker}
                filterCategory={stickerCategory}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
