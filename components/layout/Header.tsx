/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { Moon, Sun, BookOpen, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CoinDisplay } from "@/components/gamification/CoinDisplay"
import { StreakDisplay } from "@/components/gamification/StreakDisplay"
import { motion } from "framer-motion"
import { useTheme } from "@/contexts/useTheme"
import { ALL_STICKERS, useStickers } from "@/hooks/useStickers"
import { useCallback, useState } from "react"
import { useUserStats } from "@/hooks/useUserStats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sticker } from "@/types"
import { toast } from "@/hooks/use-toast"
import { StickerGrid } from "@/components/gamification/StickerShop"

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { stats, spendCoins } = useUserStats()
  const [stickerCategory, setStickerCategory] = useState<
    "all" | "book" | "character" | "achievement"
  >("all")
  const { userStickers, unlockSticker, equipSticker, unequipSticker } =
    useStickers()
  const [shopOpen, setShopOpen] = useState(false)

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
    [spendCoins, unlockSticker],
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
    [equipSticker, userStickers.equipped.length],
  )
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">
              ReadForge
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Leé. Gana y colecciona.
            </p>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-3">
          <StreakDisplay streak={stats.currentStreak} className="hidden sm:flex" />
          <CoinDisplay coins={stats.coins} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShopOpen(true)}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Tienda</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Sticker Shop Dialog */}
      <Dialog open={shopOpen} onOpenChange={setShopOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Tienda de Stickers
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={stickerCategory}
            onValueChange={(v) => setStickerCategory(v as any)}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="book">📚 Libros</TabsTrigger>
              <TabsTrigger value="character">🐾 Personajes</TabsTrigger>
              <TabsTrigger value="achievement">🏆 Logros</TabsTrigger>
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
    </motion.header>
  )
}
